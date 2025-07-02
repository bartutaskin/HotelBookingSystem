from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai
import json
import re

from intent_router import route_intent, send_request

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()


class UserInput(BaseModel):
    message: str
    userId: int  # added userId field


def extract_json(text: str) -> str:
    cleaned = re.sub(r"```json(.*?)```", r"\1", text, flags=re.DOTALL).strip()
    cleaned = re.sub(r"```(.*?)```", r"\1", cleaned, flags=re.DOTALL).strip()
    cleaned = cleaned.strip(" \n\"'")
    return cleaned


@app.post("/ai-agent")
async def ai_agent(user_input: UserInput):
    prompt = f"""
You are an AI agent for a hotel booking system. Detect the user's intent from the following known intents ONLY:

- register
- login
- search hotel
- book
- comment
- notification

For each intent, return ONLY a valid JSON object with this exact format and these fields:

1. register:
{{
  "intent": "register",
  "entities": {{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string" 
  }}
}}

2. login:
{{
  "intent": "login",
  "entities": {{
    "username": "string",
    "password": "string"
  }}
}}

3. search hotel:
{{
  "intent": "search hotel",
  "entities": {{
    "destination": "string",
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "guests": 1
  }}
}}

4. book:
{{
  "intent": "book",
  "entities": {{
    "hotelId": 0,
    "roomId": 0,
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "guests": 1,
    "userId": {user_input.userId}
  }}
}}

5. comment:
{{
  "intent": "comment",
  "entities": {{
    "hotelId": 0,
    "userId": {user_input.userId},
    "rating": 0,
    "text": "string",
    "serviceType": "string"
  }}
}}

6. notification:
{{
  "intent": "notification",
  "entities": {{}}
}}

Return ONLY the JSON, no explanation or extra text.

User input: "{user_input.message}"
"""

    try:
        openai_response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        result_text = openai_response.choices[0].message.content
        print("DEBUG > LLM response:", result_text)

        cleaned_text = extract_json(result_text)
        print("DEBUG > cleaned_text:", repr(cleaned_text))

        result_json = json.loads(cleaned_text)

        base_url = os.getenv("GATEWAY_URL")
        if not base_url:
            return {"error": "API gateway URL is not configured."}

        # Validate required fields present & non-empty for intent
        required_fields = {
            "register": ["username", "email", "password", "role"],
            "login": ["username", "password"],
            "book": ["hotelId", "roomId", "checkIn", "checkOut", "guests", "userId"],
            "comment": ["hotelId", "userId", "rating", "text", "serviceType"],
            "search hotel": ["destination", "checkIn", "checkOut", "guests"],
        }

        intent = result_json.get("intent", "").lower()
        entities = result_json.get("entities", {})

        fields = required_fields.get(intent, [])
        missing = [f for f in fields if entities.get(f) in [None, "", 0]]

        if missing:
            return {
                "error": f"Missing required fields for intent '{intent}': {missing}",
                "message": "Please provide these details.",
            }

        route_info = route_intent(intent, entities, base_url)
        if route_info is None:
            return {"error": "Intent not recognized."}

        print("Calling URL:", route_info["url"])

        response = await send_request(route_info)

        # If booking endpoint returned success, indicate bookingSuccess even if LLM parse was wonky
        if intent == "book" and response.status_code == 200:
            return {
                "bookingSuccess": True,
                "message": "Booking saved successfully.",
            }

        # Normal case: return intent and response JSON
        return {"intent": intent, "response": response.json()}

    except json.JSONDecodeError as e:
        # This means LLM response JSON parsing failed
        print("JSONDecodeError:", e)

        # You could still try to parse partial info or just return bookingSuccess if booking happened
        # But safest here is to indicate parsing error, but no bookingSuccess (frontend will handle)

        return {"error": "Failed to parse LLM JSON response."}
    except Exception as e:
        return {"error": str(e)}
