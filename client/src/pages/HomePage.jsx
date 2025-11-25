// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { fetchPosts(); }, []);
  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/posts`);
      const data = await res.json();
      setPosts(data || []);
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      <h2>All Poems</h2>
      <p><Link to="/create">Create a new poem</Link></p>
      {posts.map(p => (
        <article key={p._id || p.id} style={{ marginBottom: 12, padding: 12, borderRadius: 6, background: "#071018", color: "#fff" }}>
          <h3>{p.title}</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{p.content}</p>
          <small>by {p.author} • {new Date(p.createdAt).toLocaleString()}</small>
        </article>
      ))}
    </div>
  );
}
