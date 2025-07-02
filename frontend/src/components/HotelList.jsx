import React from "react";

function HotelList({ hotels, onSelectHotel, selectedHotelId, page, setPage }) {
  return (
    <div>
      <h2 style={{ color: "#2980b9" }}>Hotels</h2>
      {hotels.length === 0 ? (
        <p>No hotels found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hotels.map((hotel) => (
            <li
              key={hotel.id}
              style={{
                backgroundColor:
                  hotel.id === selectedHotelId ? "#d6eaf8" : "#f8f9fa",
                marginBottom: 10,
                padding: "10px 15px",
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid #ddd",
                transition: "background-color 0.2s",
              }}
              onClick={() => onSelectHotel(hotel.id)}
            >
              <strong>{hotel.name}</strong> — {hotel.city}, {hotel.address}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 15 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{
            marginRight: 10,
            padding: "5px 15px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            borderRadius: 4,
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          style={{
            padding: "5px 15px",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default HotelList;
