import React, { useState } from "react";

const Auth = ({ onLoginSuccess }) => {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername || !loginPassword) {
      setLoginError("Username and password required.");
      return;
    }

    try {
      const response = await fetch("https://localhost:7181/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (response.ok) {
  const data = await response.json();
  console.log("Login response data:", data);  // <--- Add this line
  localStorage.setItem("token", data.token);
  onLoginSuccess(data);
} else {
        const data = await response.json();
        setLoginError(data.message || "Login failed.");
      }
    } catch {
      setLoginError("Error connecting to server.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Auth;
