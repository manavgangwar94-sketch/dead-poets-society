// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./debug";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import ProtectedRoute from "./pages/ProtectedRoute";

export default function App() {
  const logged = !!localStorage.getItem("token");
  const logout = () => { 
    console.log("🚪 [App] Logging out - clearing localStorage");
    localStorage.removeItem("token"); 
    localStorage.removeItem("username");
    window.location.href = "/"; 
  };

  useEffect(() => {
    console.log("🎯 [App] Mounted - Auth state:", logged ? "✅ Logged in" : "❌ Logged out");
    console.log("🎯 [App] Token in storage:", localStorage.getItem("token") ? "✅ Present" : "❌ Missing");
  }, [logged]);

  return (
    <div className="App">
      <BrowserRouter>
        <nav className="navbar">
          <div className="navbar-brand">
           <span className="navbar-logo">🪶</span>
            <h1>Dead Poets Society</h1>
          </div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            {!logged && <Link to="/register">Register</Link>}
            {!logged && <Link to="/login">Login</Link>}
            {logged && <Link to="/create">Create</Link>}
            {logged && <button onClick={logout}>Logout</button>}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />
          <Route path="/post/:postId" element={<PostDetail />} />
        </Routes>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Dead Poets Society</h3>
              <p>A sanctuary for poets, dreamers, and those who dare to share their verses with the world. Where words dance and hearts speak.</p>
              <div className="social-links">
                <button type="button" aria-label="Twitter">𝕏</button>
                <button type="button" aria-label="Instagram">📷</button>
                <button type="button" aria-label="Facebook">f</button>
                <button type="button" aria-label="GitHub">⚡</button>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/create">Write a Poem</Link></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#guidelines">Guidelines</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Resources</h3>
              <ul className="footer-links">
                <li><a href="#inspiration">Poetry Inspiration</a></li>
                <li><a href="#workshops">Workshops</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#help">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="footer-quote">"No matter what anybody tells you, words and ideas can change the world."</p>
            <p>© {new Date().getFullYear()} Dead Poets Society. All rights reserved. Made with ❤️ by poets, for poets.</p>
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}