import React, { useEffect, useState } from "react";

function HotelList({ onSelectHotel, selectedHotelId }) {
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`https://localhost:7181/v1/hotel?pageNumber=${page}&pageSize=10`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        setHotels(data.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h2 style={{ color: "#2980b9" }}>Hotels</h2>
      {loading ? (
        <p>Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p>No hotels found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hotels.map(hotel => (
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
          onClick={() => setPage(p => Math.max(1, p - 1))}
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
          onClick={() => setPage(p => p + 1)}
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
