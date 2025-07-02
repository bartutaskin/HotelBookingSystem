import React, { useState, useEffect } from "react";

export default function RoomForm({ initialData = null, onSave, onCancel }) {
  const [roomType, setRoomType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setRoomType(initialData.roomType || "");
      setCapacity(initialData.capacity?.toString() || "");
      setPrice(initialData.price?.toString() || "");
      setAvailableFrom(initialData.availableFrom || "");
      setAvailableTo(initialData.availableTo || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!roomType || !capacity || !price) {
      setError("Room Type, Capacity, and Price are required.");
      return;
    }

    if (isNaN(parseInt(capacity)) || isNaN(parseFloat(price))) {
      setError("Capacity must be integer and Price must be a number.");
      return;
    }

    onSave({
      roomType,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      availableFrom: availableFrom || null,
      availableTo: availableTo || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        maxWidth: 500,
      }}
    >
      <h3>{initialData ? "Edit Room" : "Add Room"}</h3>

      <div style={{ marginBottom: 10 }}>
        <label>Room Type*:</label>
        <input
          type="text"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Capacity*:</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
          min={1}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Price*:</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
          min={0}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Available From (optional):</label>
        <input
          type="date"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Available To (optional):</label>
        <input
          type="date"
          value={availableTo}
          onChange={(e) => setAvailableTo(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        <button
          type="submit"
          style={{
            backgroundColor: "#27ae60",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            marginRight: 10,
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: "#bdc3c7",
            color: "#2c3e50",
            padding: "8px 16px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
