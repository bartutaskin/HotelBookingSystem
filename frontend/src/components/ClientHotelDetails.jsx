import React, { useEffect, useState } from "react";

const API_BASE_URL = "https://localhost:7181/v1/";

export default function ClientHotelDetails({ hotelId, token }) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) return;

    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}hotel/${hotelId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error("Failed to load hotel details");

        const data = await res.json();
        setHotel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId, token]);

  const handleBookRoom = (room) => {
    alert(`Booking room ${room.id} at hotel ${hotelId} - feature coming soon!`);
    // Here you could open a booking form or navigate to booking page
  };

  if (loading) return <p>Loading hotel details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!hotel) return <p>No hotel selected.</p>;

  return (
    <div style={{ backgroundColor: "#f7f9fc", padding: 20, borderRadius: 8 }}>
      <h2>{hotel.name}</h2>
      <p>
        {hotel.address}, {hotel.city}
      </p>

      <h3>Available Rooms</h3>
      {hotel.rooms.length === 0 && <p>No rooms available.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {hotel.rooms.map((room) => (
          <li
            key={room.id}
            style={{
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
          >
            <strong>{room.roomType}</strong> — Capacity: {room.capacity} <br />
            Price: ${room.price.toFixed(2)}{" "}
            {token && (
              <span style={{ color: "green", fontWeight: "bold" }}>
                (15% discount: ${(room.price * 0.85).toFixed(2)})
              </span>
            )}
            <br />
            Available from: {room.availableFrom} to {room.availableTo}
            <br />
            <button
              style={{
                marginTop: 8,
                padding: "6px 12px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() => handleBookRoom(room)}
            >
              Book Now
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
