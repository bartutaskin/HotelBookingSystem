import React, { useState, useEffect } from "react";
import HotelList from "./HotelList";
import HotelDetails from "./HotelDetails";
import HotelForm from "./HotelForm";
import RoomForm from "./RoomForm";
// import AdminNotifications from "./AdminNotifications";

const API_BASE_URL = "https://localhost:7181/v1/";

export default function AdminHome({ onLogout }) {
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showHotelForm, setShowHotelForm] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);

  useEffect(() => {
    setSelectedRoom(null);
    setRooms([]);
    if (!selectedHotelId) return;

    fetch(`${API_BASE_URL}hotel/${selectedHotelId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
      })
      .catch(() => {
        setRooms([]);
      });
  }, [selectedHotelId]);

  // Hotel handlers
  const handleAddHotel = () => {
    setEditingHotel(null);
    setShowHotelForm(true);
    setSelectedHotelId(null);
    setShowRoomForm(false);
  };

  const handleEditHotel = () => {
    if (!selectedHotelId) return;
    setEditingHotel({ id: selectedHotelId });
    setShowHotelForm(true);
    setShowRoomForm(false);
  };

  const handleDeleteHotel = async () => {
    if (!selectedHotelId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this hotel?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}hotel/${selectedHotelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete hotel");

      alert("Hotel deleted successfully");
      setSelectedHotelId(null);
      setRooms([]);
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveHotel = async (hotelData) => {
    try {
      const method = editingHotel?.id ? "PUT" : "POST";
      const url = editingHotel?.id
        ? `${API_BASE_URL}hotel/${editingHotel.id}`
        : `${API_BASE_URL}hotel`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(hotelData),
      });

      if (!response.ok) throw new Error("Failed to save hotel");

      setShowHotelForm(false);
      setEditingHotel(null);
      setSelectedHotelId(null);
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelHotelForm = () => {
    setShowHotelForm(false);
    setEditingHotel(null);
  };

  // Room handlers
  const handleAddRoom = () => {
    if (!selectedHotelId) {
      alert("Select a hotel first to add a room.");
      return;
    }
    setEditingRoom(null);
    setShowRoomForm(true);
    setSelectedRoom(null);
    setShowHotelForm(false);
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowRoomForm(false);
  };

  const handleEditRoomClick = () => {
    if (selectedRoom) {
      setEditingRoom(selectedRoom);
      setShowRoomForm(true);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}hotel/room/${selectedRoom.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete room");

      alert("Room deleted successfully");

      // Refresh rooms
      const updatedRes = await fetch(`${API_BASE_URL}hotel/${selectedHotelId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedHotel = await updatedRes.json();
      setRooms(updatedHotel.rooms || []);
      setSelectedRoom(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveRoom = async (roomData) => {
    try {
      if (!selectedHotelId) {
        alert("Please select a hotel first.");
        return;
      }

      const url = editingRoom?.id
        ? `${API_BASE_URL}hotel/room/${editingRoom.id}`
        : `${API_BASE_URL}hotel/${selectedHotelId}/room`;

      const method = editingRoom?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) throw new Error("Failed to save room");

      const updatedRes = await fetch(`${API_BASE_URL}hotel/${selectedHotelId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedHotel = await updatedRes.json();
      setRooms(updatedHotel.rooms || []);

      setShowRoomForm(false);
      setEditingRoom(null);
      setSelectedRoom(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoom(null);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#2c3e50" }}>Admin Dashboard</h1>

        {/* <AdminNotifications /> */}

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

      <div style={{ marginTop: 20 }}>
        {!showHotelForm && !showRoomForm && (
          <>
            <button onClick={handleAddHotel} style={buttonStyle("#3498db")}>
              Add Hotel
            </button>
            <button
              onClick={handleEditHotel}
              disabled={!selectedHotelId}
              style={buttonStyle(selectedHotelId ? "#f39c12" : "#bdc3c7")}
            >
              Edit Selected Hotel
            </button>
            <button
              onClick={handleDeleteHotel}
              disabled={!selectedHotelId}
              style={buttonStyle(selectedHotelId ? "#c0392b" : "#bdc3c7")}
            >
              Delete Selected Hotel
            </button>
            <button
              onClick={handleAddRoom}
              disabled={!selectedHotelId}
              style={buttonStyle(selectedHotelId ? "#27ae60" : "#bdc3c7")}
            >
              Add Room
            </button>
            <button
              onClick={handleEditRoomClick}
              disabled={!selectedRoom}
              style={buttonStyle(selectedRoom ? "#2980b9" : "#bdc3c7")}
            >
              Edit Selected Room
            </button>
            <button
              onClick={handleDeleteRoom}
              disabled={!selectedRoom}
              style={buttonStyle(selectedRoom ? "#e74c3c" : "#bdc3c7")}
            >
              Delete Selected Room
            </button>
          </>
        )}

        {showHotelForm ? (
          <HotelForm
            initialData={editingHotel || null}
            onSave={handleSaveHotel}
            onCancel={handleCancelHotelForm}
          />
        ) : showRoomForm ? (
          <RoomForm
            initialData={editingRoom || null}
            onSave={handleSaveRoom}
            onCancel={handleCancelRoomForm}
          />
        ) : (
          <>
            <HotelList
              onSelectHotel={(id) => {
                setSelectedHotelId(id);
                setSelectedRoom(null);
                setShowRoomForm(false);
                setShowHotelForm(false);
              }}
              selectedHotelId={selectedHotelId}
            />

            {selectedHotelId && (
              <section
                style={{
                  marginTop: 30,
                  padding: 20,
                  backgroundColor: "#ecf0f1",
                  borderRadius: 8,
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <HotelDetails
                  hotelId={selectedHotelId}
                  onRoomClick={handleRoomClick}
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function buttonStyle(bgColor) {
  return {
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    cursor: bgColor === "#bdc3c7" ? "not-allowed" : "pointer",
    borderRadius: 4,
    marginLeft: 10,
    marginBottom: 10,
  };
}
