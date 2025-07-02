import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import AdminHome from "./components/AdminHome";
import ClientHome from "./components/ClientHome";

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUserId = localStorage.getItem("userId");

    if (storedRole === "undefined" || !storedRole) {
      localStorage.removeItem("role");
      setUserRole(null);
    } else {
      setUserRole(storedRole.toLowerCase());
    }

    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleLoginSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.id);
    setToken(data.token);
    setUserId(data.id);

    if (data.role) {
      localStorage.setItem("role", data.role);
      setUserRole(data.role.toLowerCase());
    } else {
      localStorage.removeItem("role");
      setUserRole(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setToken(null);
    setUserId(null);
  };

  if (!userRole) return <Auth onLoginSuccess={handleLoginSuccess} />;

  if (userRole === "admin")
    return <AdminHome onLogout={handleLogout} token={token} userId={userId} />;

  if (userRole === "client")
    return <ClientHome onLogout={handleLogout} token={token} userId={userId} />;

  return <p>Unknown role: {userRole}</p>;
}
