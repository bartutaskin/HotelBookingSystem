import httpx
from datetime import datetime


def route_intent(intent: str, entities: dict, base_url: str):
    intent_lower = intent.lower()

    def to_iso(date_str):
        try:
            return datetime.fromisoformat(date_str).date().isoformat()
        except Exception:
            return date_str

    if "register" in intent_lower:
        return {
            "method": "POST",
            "url": f"{base_url}/v1/auth/register",
            "json": {
                "username": entities.get("username", ""),
                "email": entities.get("email", ""),
                "password": entities.get("password", ""),
                "role": entities.get("role", "Client"),
            },
        }
    elif "login" in intent_lower:
        return {
            "method": "POST",
            "url": f"{base_url}/v1/auth/login",
            "json": {
                "username": entities.get("username", ""),
                "password": entities.get("password", ""),
            },
        }
    elif "search hotel" in intent_lower or "available hotels" in intent_lower:
        return {
            "method": "POST",
            "url": f"{base_url}/v1/HotelSearch/search",
            "json": {
                "destination": entities.get("destination", ""),
                "checkIn": to_iso(entities.get("checkIn", "")),
                "checkOut": to_iso(entities.get("checkOut", "")),
                "guests": entities.get("guests", 1),
            },
        }
    elif "book" in intent_lower:
        return {
            "method": "POST",
            "url": f"{base_url}/v1/booking",
            "json": {
                "hotelId": entities.get("hotelId"),
                "roomId": entities.get("roomId"),
                "checkIn": to_iso(entities.get("checkIn", "")),
                "checkOut": to_iso(entities.get("checkOut", "")),
                "guests": entities.get("guests"),
                "userId": entities.get("userId"),
            },
        }
    elif "comment" in intent_lower:
        return {
            "method": "POST",
            "url": f"{base_url}/v1/comments",
            "json": {
                "hotelId": entities.get("hotelId"),
                "userId": entities.get("userId"),
                "rating": entities.get("rating"),
                "text": entities.get("text"),
                "serviceType": entities.get("serviceType"),
            },
        }
    elif "notification" in intent_lower:
        return {"method": "GET", "url": f"{base_url}/notificationHub"}
    else:
        return None


async def send_request(route_info: dict):
    async with httpx.AsyncClient(verify=False) as client:
        method = route_info["method"]
        if method == "GET":
            response = await client.get(
                route_info["url"], params=route_info.get("params")
            )
        elif method == "POST":
            response = await client.post(route_info["url"], json=route_info.get("json"))
        elif method == "PUT":
            response = await client.put(route_info["url"], json=route_info.get("json"))
        else:
            response = None
        return response
