import React, { useState } from "react";

export default function AiAgentChat({ token, userId, showToast }) {
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const AI_AGENT_API_URL = "https://localhost:7181/ai-agent";

  const sendAiRequest = async () => {
    if (!userInput.trim()) {
      showToast("Please enter a message for AI.", true);
      return;
    }
    setLoading(true);

    try {
      const body = {
        message: userInput,
        userId: parseInt(userId),
      };

      const res = await fetch(AI_AGENT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI request failed: ${errorText}`);
      }

      const data = await res.json();

      // If booking success flag returned (even if LLM parse failed before)
      if (data.bookingSuccess) {
        showToast("Booking successful!");
        setAiResponse(null);
        setUserInput("");
        return;
      }

      // If error is LLM JSON parse error but bookingSuccess not true,
      // silently hide AI response UI and no error toast (optional: you can add your own toast here)
      if (data.error === "Failed to parse LLM JSON response.") {
        setAiResponse(null);
        setUserInput("");
        return;
      }

      // Normal booking success (intent=book) or other intents
      if (data.intent === "book" && !data.error) {
        showToast("Booking successful!");
        setAiResponse(null);
        setUserInput("");
        return;
      }

      // Otherwise show AI response
      setAiResponse({
        intent: data.intent || null,
        status: data.status || null,
        message: data.message || null,
        response: data.response || null,
        details: data,
      });

      setUserInput("");
    } catch (error) {
      showToast(error.message, true);
      setAiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Chat with AI Agent</h3>
      <textarea
        rows={4}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask about hotels, booking, comments..."
        style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        disabled={loading}
      />
      <button
        onClick={sendAiRequest}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: "0.5rem 1rem",
          backgroundColor: loading ? "#95a5a6" : "#2ecc71",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {aiResponse && (
        <div
          style={{
            marginTop: 15,
            padding: 10,
            backgroundColor:
              aiResponse.status === "success"
                ? "#d4edda"
                : aiResponse.status === "error"
                ? "#f8d7da"
                : "#ecf0f1",
            color:
              aiResponse.status === "success"
                ? "#155724"
                : aiResponse.status === "error"
                ? "#721c24"
                : "#2c3e50",
            borderRadius: 4,
            maxHeight: 300,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {aiResponse.status && aiResponse.message ? (
            <>
              <strong>{aiResponse.status === "success" ? "Success:" : "Error:"}</strong>{" "}
              {aiResponse.message}
              {aiResponse.details && (
                <>
                  <hr />
                  <pre>{JSON.stringify(aiResponse.details, null, 2)}</pre>
                </>
              )}
            </>
          ) : aiResponse.response && aiResponse.intent === "search hotel" ? (
            <>
              <h4>Search Results:</h4>
              {aiResponse.response.items.map((hotel) => (
                <div key={hotel.hotelId} style={{ marginBottom: 15 }}>
                  <strong>
                    {hotel.hotelName} (Hotel ID: {hotel.hotelId}) — {hotel.city}
                  </strong>
                  <div>Address: {hotel.address}</div>
                  <div>Available Rooms:</div>
                  <ul>
                    {hotel.availableRooms.map((room) => (
                      <li key={room.roomId}>
                        {room.roomType} (Room ID: {room.roomId}) — Capacity: {room.capacity}, Price: $
                        {room.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
