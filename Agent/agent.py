import json
import warnings
import requests
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import openai

warnings.filterwarnings("ignore", message="Unverified HTTPS request")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

GATEWAY_URL = os.getenv("GATEWAY_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

openai.api_key = OPENAI_API_KEY


def build_prompt(user_input: str) -> str:
    return f"""
You are a helpful assistant for a hotel booking system.

Analyze the user's message and extract one or more actions with intents and parameters.

Supported intents and parameters:

1. SearchHotel:
    - destination (string, required)
    - checkIn (string, format YYYY-MM-DD, required)
    - checkOut (string, format YYYY-MM-DD, required)
    - guests (integer, required)

2. BookRoom:
    - hotelId (integer, required)
    - roomId (integer, required)
    - checkIn (string, format YYYY-MM-DD, required)
    - checkOut (string, format YYYY-MM-DD, required)
    - guests (integer, required)
    - userId (integer, required)

3. AddComment:
    - hotelId (integer, required)
    - userId (integer, required)
    - comment (string, required)

4. ViewComments:
    - hotelId (integer, required)
    - page (integer, optional, default 1)
    - pageSize (integer, optional, default 10)

If any required parameter is missing, respond with:
{{ "intent": "missing_info", "missing": [list of missing parameters] }}

Respond ONLY with valid JSON like:
{{
  "actions": [
    {{
      "intent": "SearchHotel",
      "parameters": {{
        "destination": "Istanbul",
        "checkIn": "2025-07-10",
        "checkOut": "2025-07-15",
        "guests": 2
      }}
    }}
  ]
}}

User message:
\"{user_input}\"
"""


def ask_openai(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are an AI assistant that ONLY responds with JSON as requested.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        max_tokens=512,
    )
    return response.choices[0].message.content.strip()


def call_api(intent: str, params: dict) -> str:
    try:
        if intent == "SearchHotel":
            response = requests.get(
                f"{GATEWAY_URL}/v1/HotelSearch/search",
                params=params,
                verify=False,
            )
            if response.status_code == 200:
                data = response.json()
                hotels = data.get("hotels") or data.get("items") or []
                if not hotels:
                    return "No hotels found matching your criteria."
                lines = []
                for h in hotels:
                    lines.append(
                        f"{h.get('name', 'Unknown')} - {h.get('address', 'No address')} - ID: {h.get('id', '?')}"
                    )
                return "Hotels found:\n" + "\n".join(lines)
            else:
                return (
                    f"Failed to search hotels ({response.status_code}): {response.text}"
                )

        elif intent == "BookRoom":
            response = requests.post(
                f"{GATEWAY_URL}/v1/booking",
                json=params,
                verify=False,
            )
            if response.status_code == 200:
                return "Booking successful! 🎉"
            else:
                return f"Booking failed ({response.status_code}): {response.text}"

        elif intent == "AddComment":
            response = requests.post(
                f"{GATEWAY_URL}/v1/comments",
                json=params,
                verify=False,
            )
            if response.status_code == 200:
                return "Comment added successfully."
            else:
                return (
                    f"Failed to add comment ({response.status_code}): {response.text}"
                )

        elif intent == "ViewComments":
            response = requests.get(
                f"{GATEWAY_URL}/v1/comments",
                params=params,
                verify=False,
            )
            if response.status_code == 200:
                data = response.json()
                comments = data.get("comments") or data.get("items") or []
                if not comments:
                    return "No comments found for this hotel."
                lines = []
                for c in comments:
                    user = c.get("userName", "Anonymous")
                    text = c.get("text") or c.get("comment") or ""
                    lines.append(f"{user}: {text}")
                return "Comments:\n" + "\n".join(lines)
            else:
                return (
                    f"Failed to get comments ({response.status_code}): {response.text}"
                )

        else:
            return f"Unknown intent: {intent}"

    except Exception as e:
        return f"API call failed: {str(e)}"


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("Hi! How can I assist you with hotels today?")

    while True:
        try:
            user_message = await websocket.receive_text()
            print("User message:", user_message)

            prompt = build_prompt(user_message)
            llm_response = ask_openai(prompt)
            print("LLM response:", llm_response)

            try:
                data = json.loads(llm_response)
            except json.JSONDecodeError:
                await websocket.send_text(
                    "⚠️ Sorry, I couldn't understand your request. Please try again."
                )
                continue

            if data.get("intent") == "missing_info":
                missing = data.get("missing", [])
                await websocket.send_text(
                    f"🛑 I need more information: {', '.join(missing)}"
                )
                continue

            actions = data.get("actions")
            if not actions and "intent" in data:
                parameters = data.get("parameters", {})
                actions = [{"intent": data["intent"], "parameters": parameters}]

            if not actions:
                await websocket.send_text(
                    "⚠️ Sorry, I couldn't find any actionable intent."
                )
                continue

            for action in actions:
                intent = action.get("intent")
                params = action.get("parameters", {})

                missing_params = []
                if intent == "SearchHotel":
                    for p in ["destination", "checkIn", "checkOut", "guests"]:
                        if p not in params or params[p] in [None, ""]:
                            missing_params.append(p)
                elif intent == "BookRoom":
                    for p in [
                        "hotelId",
                        "roomId",
                        "checkIn",
                        "checkOut",
                        "guests",
                        "userId",
                    ]:
                        if p not in params or params[p] in [None, ""]:
                            missing_params.append(p)
                elif intent == "AddComment":
                    for p in ["hotelId", "userId", "comment"]:
                        if p not in params or params[p] in [None, ""]:
                            missing_params.append(p)
                elif intent == "ViewComments":
                    if "hotelId" not in params or params["hotelId"] in [None, ""]:
                        missing_params.append("hotelId")

                if missing_params:
                    await websocket.send_text(
                        f"🛑 Missing parameters for {intent}: {', '.join(missing_params)}"
                    )
                    continue

                print(f"Calling API for intent: {intent} with params: {params}")
                result = call_api(intent, params)
                await websocket.send_text(result)

        except Exception as e:
            print("Error:", e)
            try:
                await websocket.send_text(f"❌ Internal error: {str(e)}")
            except:
                pass
            break
