
// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        nav("/");
      } else setError(data.error || "Login failed");
    } catch (err) { setError("Network error"); }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /><br/>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /><br/>
        <div style={{ color: "red" }}>{error}</div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
