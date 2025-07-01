import React, { useEffect } from "react";

export default function Toast({ message, isError, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        backgroundColor: isError ? "#e74c3c" : "#27ae60",
        color: "white",
        padding: "12px 20px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1500,
        fontWeight: "bold",
        minWidth: 200,
        userSelect: "none",
      }}
    >
      {message}
    </div>
  );
}
