// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./pages/ProtectedRoute"; // your file already exists

export default function App() {
  const logged = !!localStorage.getItem("token");
  const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  return (
    <BrowserRouter>
      <header style={{ padding: 14, background: "#071018", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Dead Poets Society</h1>
          <nav style={{ marginLeft: 12 }}>
            <Link to="/" style={{ marginRight: 12, color: "#fff" }}>Home</Link>
            {!logged && <Link to="/register" style={{ marginRight: 12, color: "#fff" }}>Register</Link>}
            {!logged && <Link to="/login" style={{ marginRight: 12, color: "#fff" }}>Login</Link>}
            {logged && <Link to="/create" style={{ marginRight: 12, color: "#fff" }}>Create</Link>}
            {logged && <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "18px auto", padding: "0 14px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
