// client/src/components/Navbar.js

import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ logged, logout }) {
  return (
    <header className="navbar">
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1>Dead Poets Society</h1>
      </Link>

      <nav className="navbar-links">
        <Link to="/">Home</Link>

        {!logged && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}

        {logged && (
          <>
            <Link to="/create">Write</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}