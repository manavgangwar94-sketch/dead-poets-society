// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { alert("Registered — please login"); nav("/login"); }
      else setError(data.error || "Register failed");
    } catch (err) { setError("Network error"); }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required /><br/>
        <input name="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /><br/>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /><br/>
        <div style={{ color: "red" }}>{error}</div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

