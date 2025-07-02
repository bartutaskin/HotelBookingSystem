import React, { useState } from "react";

export default function AiAgentChat({ token, userId, showToast, onBookRoom }) {
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

      if (data.bookingSuccess) {
        showToast("Booking successful!");
        setAiResponse(null);
        setUserInput("");
        return;
      }

      if (data.error === "Failed to parse LLM JSON response.") {
        setAiResponse(null);
        setUserInput("");
        return;
      }

      if (data.intent === "book" && !data.error) {
        showToast("Booking successful!");
        setAiResponse(null);
        setUserInput("");
        return;
      }

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

  // Styles
  const styles = {
    container: {
      marginTop: 30,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: 700,
      marginLeft: "auto",
      marginRight: "auto",
      padding: "0 15px",
    },
    heading: {
      marginBottom: 20,
      color: "#2c3e50",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.8rem",
    },
    textarea: {
      width: "100%",
      padding: 12,
      borderRadius: 6,
      border: "1.5px solid #ccc",
      fontSize: 16,
      resize: "vertical",
      boxShadow: "0 2px 5px rgb(0 0 0 / 0.1)",
      fontFamily: "inherit",
      transition: "border-color 0.3s ease",
    },
    textareaFocus: {
      borderColor: "#2ecc71",
      outline: "none",
      boxShadow: "0 0 8px rgba(46, 204, 113, 0.6)",
    },
    button: {
      marginTop: 15,
      padding: "0.75rem 1.2rem",
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      width: "100%",
      fontWeight: "600",
      fontSize: 16,
      boxShadow: "0 4px 10px rgb(39 174 96 / 0.6)",
      transition: "background-color 0.3s ease",
    },
    buttonDisabled: {
      backgroundColor: "#95a5a6",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    responseBox: {
      marginTop: 25,
      padding: 15,
      borderRadius: 8,
      maxHeight: 320,
      overflowY: "auto",
      fontFamily: "'Courier New', Courier, monospace",
      whiteSpace: "pre-wrap",
      boxShadow: "0 3px 12px rgb(0 0 0 / 0.1)",
    },
    responseSuccess: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1.5px solid #c3e6cb",
    },
    responseError: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1.5px solid #f5c6cb",
    },
    responseNeutral: {
      backgroundColor: "#ecf0f1",
      color: "#2c3e50",
      border: "1.5px solid #bdc3c7",
    },
    hotelCard: {
      backgroundColor: "white",
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      boxShadow: "0 2px 8px rgb(0 0 0 / 0.08)",
      border: "1px solid #e1e4e8",
    },
    hotelTitle: {
      fontWeight: "700",
      fontSize: "1.1rem",
      color: "#34495e",
      marginBottom: 5,
    },
    hotelCity: {
      fontWeight: "500",
      color: "#7f8c8d",
      marginBottom: 8,
    },
    hotelAddress: {
      marginBottom: 12,
      color: "#566573",
    },
    roomsList: {
      listStyle: "none",
      paddingLeft: 0,
      marginTop: 0,
    },
    roomItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 10px",
      borderBottom: "1px solid #ecf0f1",
      fontSize: 15,
      color: "#2c3e50",
    },
    bookButton: {
      backgroundColor: "#2980b9",
      color: "white",
      border: "none",
      borderRadius: 5,
      padding: "6px 12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: 14,
      transition: "background-color 0.3s ease",
    },
    bookButtonHover: {
      backgroundColor: "#1c5980",
    },
    sectionTitle: {
      fontWeight: "600",
      fontSize: "1.2rem",
      color: "#34495e",
      marginBottom: 15,
      borderBottom: "2px solid #2ecc71",
      paddingBottom: 4,
    },
    preDetails: {
      backgroundColor: "#f7f9fa",
      padding: 10,
      borderRadius: 6,
      fontSize: 13,
      marginTop: 12,
      border: "1px solid #ddd",
      whiteSpace: "pre-wrap",
      maxHeight: 150,
      overflowY: "auto",
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Chat with AI Agent</h3>
      <textarea
        rows={4}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask about hotels, booking, comments..."
        style={styles.textarea}
        disabled={loading}
        onFocus={(e) => (e.target.style.borderColor = "#2ecc71")}
        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
      />
      <button
        onClick={sendAiRequest}
        disabled={loading}
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {}),
        }}
        onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#27ae60")}
        onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = "#2ecc71")}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {aiResponse && (
        <div
          style={{
            ...styles.responseBox,
            ...(aiResponse.status === "success"
              ? styles.responseSuccess
              : aiResponse.status === "error"
              ? styles.responseError
              : styles.responseNeutral),
          }}
        >
          {aiResponse.status && aiResponse.message ? (
            <>
              <strong>{aiResponse.status === "success" ? "Success:" : "Error:"}</strong> {aiResponse.message}
              {aiResponse.details && (
                <pre style={styles.preDetails}>{JSON.stringify(aiResponse.details, null, 2)}</pre>
              )}
            </>
          ) : aiResponse.response && aiResponse.intent === "search hotel" ? (
            <>
              <h4 style={styles.sectionTitle}>Search Results:</h4>
              {aiResponse.response.items.map((hotel) => (
                <div key={hotel.hotelId} style={styles.hotelCard}>
                  <div style={styles.hotelTitle}>
                    {hotel.hotelName} (Hotel ID: {hotel.hotelId})
                  </div>
                  <div style={styles.hotelCity}>{hotel.city}</div>
                  <div style={styles.hotelAddress}>Address: {hotel.address}</div>
                  <div>Available Rooms:</div>
                  <ul style={styles.roomsList}>
                    {hotel.availableRooms.map((room) => (
                      <li key={room.roomId} style={styles.roomItem}>
                        <div>
                          {room.roomType} (Room ID: {room.roomId}) — Capacity: {room.capacity}, Price: $
                          {room.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => onBookRoom && onBookRoom(hotel.hotelId, room.roomId)}
                          style={styles.bookButton}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1c5980")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2980b9")}
                        >
                          Book Now
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            <pre style={styles.preDetails}>{JSON.stringify(aiResponse, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
