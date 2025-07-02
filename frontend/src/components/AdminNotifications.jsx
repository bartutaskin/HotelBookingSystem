import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function AdminNotifications({ token }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7181/notificationHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("SignalR connected"))
      .catch(err => console.error("SignalR connection error:", err));

    connection.on("ReceiveNotification", (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      connection.stop();
    };
  }, [token]);

  return (
    <div style={{ position: "fixed", top: 20, right: 20, maxWidth: 300, zIndex: 2000 }}>
      {notifications.map((notif, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#3498db",
            color: "white",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: "0.9rem",
          }}
        >
          <strong>{notif.title || "Notification"}</strong>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
