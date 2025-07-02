import React, { useState, useEffect } from "react";

function HotelForm({ initialData = null, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCity(initialData.city || "");
      setAddress(initialData.address || "");
      setLatitude(initialData.latitude ?? "");
      setLongitude(initialData.longitude ?? "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || !city || !address) {
      setError("Name, City and Address are required.");
      return;
    }

    onSave({
      name,
      city,
      address,
      latitude: latitude === "" ? null : parseFloat(latitude),
      longitude: longitude === "" ? null : parseFloat(longitude),
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
      <h3>{initialData ? "Edit Hotel" : "Add Hotel"}</h3>

      <div style={{ marginBottom: 10 }}>
        <label>Name*:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>City*:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Address*:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Latitude:</label>
        <input
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          placeholder="Optional"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Longitude:</label>
        <input
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          style={{ width: "100%", padding: 6, marginTop: 4 }}
          placeholder="Optional"
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

export default HotelForm;
