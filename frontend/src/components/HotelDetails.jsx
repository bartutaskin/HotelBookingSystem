import React, { useEffect, useState } from "react";

function HotelDetails({ hotelId, onRoomClick, selectedRoomId }) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) return;

    setLoading(true);
    setError(null);

    fetch(`https://localhost:7181/v1/hotel/${hotelId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch hotel details");
        return res.json();
      })
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, [hotelId]);

  if (loading) return <p>Loading hotel details...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!hotel) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ color: "#34495e" }}>{hotel.name}</h3>
      <p>
        <strong>City:</strong> {hotel.city}
        <br />
        <strong>Address:</strong> {hotel.address}
      </p>

      <h4 style={{ marginTop: 20, color: "#2980b9" }}>Rooms</h4>
      {hotel.rooms.length === 0 ? (
        <p>No rooms available.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 10,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Type</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Capacity</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Price</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Available From</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Available To</th>
            </tr>
          </thead>
          <tbody>
            {hotel.rooms.map((room) => (
              <tr
                key={room.id}
                onClick={() => onRoomClick && onRoomClick(room)}
                style={{
                  cursor: onRoomClick ? "pointer" : "default",
                  backgroundColor: selectedRoomId === room.id ? "#d6eaf8" : "white"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9f9f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {room.roomType}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {room.capacity}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  ${room.price.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {room.availableFrom}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {room.availableTo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HotelDetails;
