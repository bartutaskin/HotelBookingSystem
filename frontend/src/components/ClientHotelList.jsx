import React from "react";

export default function HotelList({
  searchResults,
  selectedHotel,
  selectedRoom,
  setSelectedHotel,
  setSelectedRoom,
  isFiltered,
  pageNumber,
  goPrevPage,
  goNextPage,
  pageSize,
  onBookClick,
}) {
  const paginationBtnStyle = (disabled) => ({
    padding: "0.5rem 1rem",
    marginRight: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: disabled ? "#bdc3c7" : "#3498db",
    color: "white",
    border: "none",
    borderRadius: 4,
  });

  return (
    <section>
      <h2>
        Hotels
        {searchResults.totalCount > pageSize
          ? ` (Page ${pageNumber} of ${searchResults.totalPages})`
          : ""}
      </h2>
      {searchResults.items.length === 0 ? (
        <p>No hotels found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {searchResults.items.map((hotel) => (
            <li
              key={isFiltered ? hotel.hotelId : hotel.id}
              style={{
                cursor: "pointer",
                padding: "10px",
                backgroundColor:
                  selectedHotel &&
                  ((isFiltered && selectedHotel.hotelId === hotel.hotelId) ||
                    (!isFiltered && selectedHotel.id === hotel.id))
                    ? "#d0e6f7"
                    : "#f0f0f0",
                marginBottom: 10,
                borderRadius: 6,
              }}
              onClick={() => {
                setSelectedRoom(null);
                setSelectedHotel(hotel);
              }}
            >
              <strong>{isFiltered ? hotel.hotelName : hotel.name}</strong> —{" "}
              {hotel.city}
              <br />
              {hotel.address}

              {isFiltered &&
                hotel.availableRooms &&
                hotel.availableRooms.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 10 }}>Available Rooms</h4>
                    <ul style={{ listStyle: "none", paddingLeft: 10 }}>
                      {hotel.availableRooms.map((room) => (
                        <li
                          key={room.roomId}
                          style={{
                            cursor: "pointer",
                            padding: "6px",
                            backgroundColor:
                              selectedRoom?.roomId === room.roomId
                                ? "#c2f0c2"
                                : "#ffffff",
                            marginBottom: 4,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
                            setSelectedHotel(hotel);
                          }}
                        >
                          <strong>{room.roomType}</strong> — Capacity:{" "}
                          {room.capacity} — Price: $
                          {room.discountedPrice.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={
                        !selectedRoom || selectedHotel.hotelId !== hotel.hotelId
                      }
                      onClick={() => onBookClick(hotel, selectedRoom)}
                      style={{
                        marginTop: 10,
                        padding: "0.5rem 1rem",
                        cursor:
                          selectedRoom && selectedHotel.hotelId === hotel.hotelId
                            ? "pointer"
                            : "not-allowed",
                        backgroundColor:
                          selectedRoom && selectedHotel.hotelId === hotel.hotelId
                            ? "#27ae60"
                            : "#bdc3c7",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                      }}
                    >
                      Book Selected Room
                    </button>
                  </>
                )}
            </li>
          ))}
        </ul>
      )}
      {searchResults.totalPages > 1 && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={goPrevPage}
            disabled={pageNumber === 1}
            style={paginationBtnStyle(pageNumber === 1)}
          >
            Prev
          </button>
          <button
            onClick={goNextPage}
            disabled={pageNumber === searchResults.totalPages}
            style={paginationBtnStyle(pageNumber === searchResults.totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
