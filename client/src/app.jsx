// client/src/App.jsx

import React from "react";
// We don't need 'Link' here anymore, it moves to the NavBar component
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Note: I'm assuming your imports (Home, Login, Register...) are components
// and changing the names to match the file names you showed (e.g., HomePage.jsx)
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar"; // <-- Import the Navbar component

export default function App() {
  // We keep logged state and logout function here for now, 
  // but we will pass them to Navbar to handle conditional links.
  const logged = !!localStorage.getItem("token");
  const logout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  return (
    <BrowserRouter>
      {/* 1. Replace the inline <header> with the dedicated <Navbar /> component.
           Pass 'logged' state and 'logout' function down as props.
      */}
      <Navbar logged={logged} logout={logout} />

      <main>
        <div style={{ padding: '20px' }}> {/* Add a wrapper for main content spacing */}
          <Routes>
            {/* These routes are now properly separated */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/create" element={
              // This is great: using ProtectedRoute to guard the CreatePost page
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
