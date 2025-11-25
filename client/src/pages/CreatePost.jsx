// src/pages/CreatePost.jsx
import React, { useState } from "react";
import { API, authHeaders } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(form),
      });
      if (res.ok) nav("/");
      else {
        const data = await res.json();
        setError(data.error || "Create failed");
      }
    } catch (err) { setError("Network error"); }
  };

  return (
    <div>
      <h2>Create a New Poem</h2>
      <form onSubmit={onSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required /><br/>
        <textarea name="content" placeholder="Your poem..." value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required /><br/>
        <div style={{ color: "red" }}>{error}</div>
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
