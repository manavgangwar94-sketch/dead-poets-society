// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { setAuthToken } from "../auth";

export default function RegisterPage() {
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(form);
      console.log("Register response:", data);
      
      if (data.token) {
        console.log("✅ [Register] Token received:", data.token.substring(0, 20) + "...");
        
        // Use auth helper to store
        const stored = setAuthToken(data.token, data.user?.displayName || form.displayName, data.user?.id);
        
        if (stored) {
          console.log("✅ [Register] ✅ Successfully authenticated and stored");
          
          alert("Welcome to the Dead Poets Society!");
          
          // Use setTimeout and navigate
          setTimeout(() => {
            nav("/");
          }, 100);
        } else {
          setError("Failed to store authentication token");
        }
      } else if (data.user || data.message) {
        alert("Registered successfully! Please login");
        nav("/login");
      } else {
        setError(data.error || "Register failed");
      }
    } catch (err) {
      setError("Error: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="page-header">
        <h1>Join Us</h1>
        <p>Start your poetic journey today</p>
      </div>

      <div className="flashcard">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              name="displayName"
              placeholder="Your display name"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              placeholder="your@email.com"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-success"
            style={{ width: "100%", padding: "0.8rem" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", color: "#cbd5e1" }}>
          <p>Already a member? <Link to="/login" style={{ color: "#60a5fa", fontWeight: 600 }}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

