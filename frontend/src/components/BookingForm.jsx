import React from "react";

export default function BookingForm({ bookingForm, setBookingForm, onSubmit, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 8,
          minWidth: 320,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Booking Form</h3>
        <label>
          Check-In Date:
          <input
            type="date"
            value={bookingForm.checkIn}
            onChange={(e) =>
              setBookingForm((prev) => ({ ...prev, checkIn: e.target.value }))
            }
            required
          />
        </label>
        <label style={{ display: "block", marginTop: 10 }}>
          Check-Out Date:
          <input
            type="date"
            value={bookingForm.checkOut}
            onChange={(e) =>
              setBookingForm((prev) => ({ ...prev, checkOut: e.target.value }))
            }
            required
          />
        </label>
        <label style={{ display: "block", marginTop: 10 }}>
          Guests:
          <input
            type="number"
            min="1"
            value={bookingForm.guests}
            onChange={(e) =>
              setBookingForm((prev) => ({
                ...prev,
                guests: parseInt(e.target.value) || 1,
              }))
            }
            required
          />
        </label>
        <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
          <button onClick={onSubmit} style={{ flex: 1 }}>
            Submit
          </button>
          <button onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
