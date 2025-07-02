import React from "react";

export default function RoomList({ rooms, onSelectRoom, selectedRoomId }) {
  if (!rooms || rooms.length === 0) return <p>No rooms available.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {rooms.map(room => (
        <li
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          style={{
            backgroundColor: room.id === selectedRoomId ? "#d6eaf8" : "#f8f9fa",
            marginBottom: 8,
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid #ddd",
          }}
        >
          <strong>{room.roomType}</strong> — Capacity: {room.capacity} — Price: ${room.price}
        </li>
      ))}
    </ul>
  );
}
