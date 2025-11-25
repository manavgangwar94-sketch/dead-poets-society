// client/src/components/Navbar.js

import React from "react";
import { Link } from "react-router-dom"; // Use Link for navigation

// Component receives 'logged' status and 'logout' function from App.jsx
export default function Navbar({ logged, logout }) {
  // Define styles to match your existing dark theme
  const navStyles = {
    padding: "12px 20px", // Add horizontal padding
    background: "#071018",
    color: "#fff",
    borderBottom: "1px solid #1a232b", // Optional: subtle separator
    display: "flex",
    justifyContent: "space-between", // Puts title on left, links on right
    alignItems: "center"
  };

  const linkStyle = {
    color: "#ccc",
    textDecoration: "none",
    margin: "0 10px", // Increased spacing
    padding: "5px 0",
    transition: "color 0.2s"
  };

  return (
    <header style={navStyles}>
      {/* 1. Title/Branding */}
      <Link to="/" style={{ textDecoration: "none", color: "#fff", fontSize: "1.5em", fontWeight: "bold" }}>
        Dead Poets Society
      </Link>

      {/* 2. Navigation Links */}
      <nav>
        <Link to="/" style={linkStyle}>Home</Link>

        {/* Links for Logged OUT users */}
        {!logged && (
          <>
            <Link to="/register" style={linkStyle}>Register</Link>
            <Link to="/login" style={linkStyle}>Login</Link>
          </>
        )}

        {/* Links for Logged IN users */}
        {logged && (
          <>
            <Link to="/create" style={linkStyle}>Create New Poem</Link>
            <button 
              onClick={logout} 
              style={{
                background: '#4a148c', // A subtle purple accent
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}