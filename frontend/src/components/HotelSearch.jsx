import React, { useState } from "react";

const API_BASE_URL = "https://localhost:7181/v1/";

export default function HotelSearch({ token, onSearchComplete }) {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);

    if (!destination || !checkIn || !checkOut || !guests) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}HotelSearch/search?pageNumber=1&pageSize=10`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            Destination: destination,
            CheckIn: checkIn,
            CheckOut: checkOut,
            Guests: guests,
          }),
        }
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      onSearchComplete(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        backgroundColor: "#fafafa",
        boxShadow: "0 0 8px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: 20, color: "#2c3e50" }}>Filter Hotels</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label style={{ fontWeight: "bold", color: "#34495e" }}>
          Destination
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontWeight: "bold", color: "#34495e" }}>
          Check-in
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontWeight: "bold", color: "#34495e" }}>
          Check-out
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontWeight: "bold", color: "#34495e" }}>
          Guests
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 0",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
