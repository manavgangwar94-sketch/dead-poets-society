
// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { setAuthToken } from "../auth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      console.log("🔐 [Login] Response:", data);
      if (data.token) {
        console.log("🔐 [Login] Token received:", data.token.substring(0, 20) + "...");
        
        // Use auth helper to store
        const stored = setAuthToken(data.token, data.user?.username || form.email);
        
        if (stored) {
          console.log("🔐 [Login] ✅ Successfully authenticated and stored");
          setTimeout(() => {
            nav("/");
          }, 100);
        } else {
          setError("Failed to store authentication token");
        }
      } else {
        console.error("🔐 [Login] No token in response:", data);
        setError(data.error || "Login failed");
      }
    } catch (err) { 
      setError("Network error: " + err.message);
      console.error("🔐 [Login] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="page-header">
        <h1>Welcome Back</h1>
        <p>Login to share your poetry</p>
      </div>

      <div className="flashcard">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              name="email" 
              type="email"
              placeholder="your@email.com" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
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
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.8rem" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", color: "#cbd5e1" }}>
          <p>Don't have an account? <Link to="/register" style={{ color: "#60a5fa", fontWeight: 600 }}>Register here</Link></p>
        </div>
      </div>
    </div>
  );
}