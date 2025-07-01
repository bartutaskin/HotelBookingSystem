import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function AdminNotifications() {
  const [connection, setConnection] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7181/notificationHub", {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("Connected to SignalR notification hub"))
      .catch((err) => console.error("SignalR connection error: ", err));

    connection.on("ReceiveNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      alert(`Notification: ${notification.Title} - ${notification.Message}`);
    });

    setConnection(connection);

    return () => {
      connection.stop();
    };
  }, []);

  const handleClick = () => {
    if (notifications.length === 0) {
      alert("No new notifications");
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        aria-label="Notifications"
        onClick={handleClick}
        style={{ position: "relative", cursor: "pointer" }}
      >
        🔔
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {showDropdown && notifications.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            borderRadius: 4,
            width: 300,
            maxHeight: 400,
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          {notifications.map((note, i) => (
            <div
              key={i}
              style={{
                padding: "0.5rem",
                borderBottom: "1px solid #eee",
                cursor: "default",
              }}
              title={note.Message}
            >
              <strong>{note.Title}</strong>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>{note.Message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
