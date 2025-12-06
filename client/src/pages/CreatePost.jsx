// src/pages/CreatePost.jsx
import React, { useState } from "react";
import { createPost } from "../api";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../auth";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  
  // Get token using auth helper
  const token = getAuthToken();

  console.log("🔍 [CreatePost] Component mounted");
  console.log("🔍 [CreatePost] Token from getAuthToken():", token ? token.substring(0, 30) + "..." : "❌ MISSING");

  if (!token) {
    return <div className="error" style={{ maxWidth: 600, margin: "2rem auto" }}>❌ Please login first to create a post. Token not found.</div>;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("=== CREATE POST DEBUG ===");
    console.log("Token from outer scope:", token ? token.substring(0, 20) + "..." : "MISSING");
    console.log("Token exists:", !!token);
    console.log("Form data:", form);

    if (!token) {
      setError("Not logged in. Please login first.");
      setLoading(false);
      return;
    }

    try {
      if (form.content.length < 10) {
        setError("Poem must be at least 10 characters long");
        setLoading(false);
        return;
      }

      const tagsArray = form.tags
        ? form.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
        : [];

      const postPayload = {
        title: form.title,
        message: form.content,
        tags: tagsArray,
      };

      console.log("Sending POST request to /api/posts");
      console.log("Payload:", postPayload);
      console.log("Token being sent to createPost():", token ? token.substring(0, 20) + "..." : "NULL OR UNDEFINED");
      console.log("typeof token:", typeof token);
      console.log("token === null:", token === null);
      console.log("token === undefined:", token === undefined);
      console.log("!!token:", !!token);

      const data = await createPost(postPayload, token);
      console.log("✅ Response received:", data);

      if (data.post || data.message) {
        alert("Poem posted successfully!");
        setForm({ title: "", content: "", tags: "" });
        nav("/");
      } else {
        setError(data.error || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Write Your Poem</h1>
        <p>Share your inspiration with the world</p>
      </div>

      <div className="flashcard" style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              placeholder="Give your poem a beautiful title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              placeholder="Pour your heart out... (minimum 10 characters)"
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
              rows="10"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              name="tags"
              placeholder="e.g., love, nature, hope, inspiration (comma-separated)"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="btn-group" style={{ marginTop: "2rem" }}>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary"
              style={{ flex: 1, padding: "0.8rem" }}
            >
              {loading ? "Publishing..." : "Publish Poem"}
            </button>
            <button 
              type="button" 
              onClick={() => nav("/")} 
              className="btn btn-secondary"
              style={{ flex: 1, padding: "0.8rem" }}
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
