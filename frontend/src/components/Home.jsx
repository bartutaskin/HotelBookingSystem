import React from "react";

const Home = ({ user, logout }) => {
  if (!user) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {user.username}!</h1>
      <p>Your role: {user.role}</p>

      {user.role.toLowerCase() === "admin" && (
        <div>
          <h2>Admin Dashboard (mockup)</h2>
          <ul>
            <li><a href="/hotel-admin">Manage Hotels</a></li>
            <li><a href="/notifications">View Notifications</a></li>
          </ul>
        </div>
      )}

      {user.role.toLowerCase() === "client" && (
        <div>
          <h2>Client Dashboard (mockup)</h2>
          <ul>
            <li><a href="/hotel-search">Search Hotels</a></li>
            <li><a href="/my-bookings">My Bookings</a></li>
            <li><a href="/comments">Leave Comments</a></li>
          </ul>
        </div>
      )}

      <button onClick={logout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
};

export default Home;
