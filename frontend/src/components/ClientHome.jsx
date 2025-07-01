import React, { useState, useEffect } from "react";
import HotelSearch from "./HotelSearch";
import ClientHotelList from "./ClientHotelList";
import BookingForm from "./BookingForm";
import Toast from "./Toast";
import Comments from "./Comments"; // Import the Comments component

const API_BASE_URL = "https://localhost:7181/v1/";

export default function ClientHome({ onLogout, token, userId }) {
  const [searchResults, setSearchResults] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [bookingForm, setBookingForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    showForm: false,
    hotel: null,
    room: null,
  });

  const [toast, setToast] = useState({ show: false, message: "", isError: false });

  const pageSize = 10;

  useEffect(() => {
    loadAllHotels();
  }, []);

  const isFiltered =
    searchResults &&
    searchResults.items.length > 0 &&
    searchResults.items[0].hotelId !== undefined;

  const loadAllHotels = async (page = 1) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}HotelSearch/all?pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load hotels");
      const data = await res.json();
      setSearchResults(data);
      setSelectedHotel(null);
      setSelectedRoom(null);
    } catch (error) {
      showToast(error.message, true);
    }
  };

  const handleSearch = (data) => {
    setSearchResults(data);
    setSelectedHotel(null);
    setSelectedRoom(null);
    setPageNumber(1);
  };

  const goPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      loadAllHotels(newPage);
    }
  };

  const goNextPage = () => {
    if (searchResults && pageNumber < searchResults.totalPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      loadAllHotels(newPage);
    }
  };

  const closeBookingForm = () => {
    setBookingForm((prev) => ({ ...prev, showForm: false }));
  };

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: "", isError: false }), 3000);
  };

  const submitBooking = async () => {
    const { checkIn, checkOut, guests, hotel, room } = bookingForm;

    if (!checkIn || !checkOut || !guests) {
      showToast("Please fill all booking details.", true);
      return;
    }

    const hotelId = hotel?.hotelId ?? hotel?.id;
    const roomId = room?.roomId ?? room?.id;

    if (!hotelId || !roomId) {
      showToast("Hotel ID or Room ID is missing.", true);
      return;
    }

    const parsedUserId = parseInt(userId);
    if (!parsedUserId || isNaN(parsedUserId)) {
      showToast("User ID is missing or invalid.", true);
      return;
    }

    try {
      const body = {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        userId: parsedUserId,
      };

      const res = await fetch(`${API_BASE_URL}booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Booking failed: ${errorText}`);
      }

      showToast("Booking successful!");
      setBookingForm({ checkIn: "", checkOut: "", guests: 1, showForm: false, hotel: null, room: null });
      setSelectedHotel(null);
      setSelectedRoom(null);
      setSearchResults(null);
      loadAllHotels();
    } catch (error) {
      showToast(error.message, true);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        gap: 20,
      }}
    >
      <div style={{ flex: "0 0 320px" }}>
        <HotelSearch token={token} onSearchComplete={handleSearch} />
        <button
          onClick={() => {
            setPageNumber(1);
            loadAllHotels(1);
          }}
          style={{
            marginTop: 10,
            padding: "0.5rem 1rem",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Show All Hotels
        </button>
      </div>

      <div style={{ flex: "1", minWidth: 0 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h1 style={{ color: "#2c3e50" }}>Client Dashboard</h1>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            Logout
          </button>
        </header>

        {searchResults && (
          <ClientHotelList
            searchResults={searchResults}
            selectedHotel={selectedHotel}
            selectedRoom={selectedRoom}
            setSelectedHotel={setSelectedHotel}
            setSelectedRoom={setSelectedRoom}
            isFiltered={isFiltered}
            pageNumber={pageNumber}
            goPrevPage={goPrevPage}
            goNextPage={goNextPage}
            pageSize={pageSize}
            onBookClick={(hotel, room) =>
              setBookingForm({
                checkIn: "",
                checkOut: "",
                guests: 1,
                showForm: true,
                hotel,
                room,
              })
            }
          />
        )}

        {bookingForm.showForm && (
          <BookingForm
            bookingForm={bookingForm}
            setBookingForm={setBookingForm}
            onSubmit={submitBooking}
            onClose={closeBookingForm}
          />
        )}

        {/* Render Comments only if a hotel is selected */}
        {selectedHotel && (
          <Comments
            token={token}
            hotelId={selectedHotel.hotelId ?? selectedHotel.id}
            userId={parseInt(userId)}
            showToast={showToast} // Pass showToast callback to Comments
          />
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          isError={toast.isError}
          onClose={() => setToast({ show: false, message: "", isError: false })}
        />
      )}
    </div>
  );
}
