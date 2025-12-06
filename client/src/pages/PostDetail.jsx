// src/pages/PostDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, likePost, updatePost, deletePost } from "../api";

export default function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "", tags: "" });

  useEffect(() => {
    fetchPost();
  }, [postId]);

  async function fetchPost() {
    try {
      setLoading(true);
      const data = await getPostById(postId);
      if (data.post) {
        setPost(data.post);
        setEditForm({
          title: data.post.title,
          content: data.post.message,
          tags: data.post.tags?.join(", ") || "",
        });
      } else {
        setError("Post not found");
      }
    } catch (err) {
      setError("Failed to load post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    try {
      const tagsArray = editForm.tags
        ? editForm.tags.split(",").map(t => t.trim()).filter(t => t)
        : [];

      const data = await updatePost(postId, {
        title: editForm.title,
        message: editForm.content,
        tags: tagsArray,
      }, token);

      if (data.post) {
        setPost(data.post);
        setIsEditing(false);
        alert("Post updated successfully!");
      } else {
        setError(data.error || "Failed to update post");
      }
    } catch (err) {
      setError("Error updating post: " + err.message);
    }
  }

  async function handleDelete() {
    if (post.creator !== username) {
      alert("You can only delete your own posts");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deletePost(postId, token);
      alert("Post deleted successfully!");
      nav("/");
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  }

  async function handleLike() {
    if (!token) {
      alert("Please login to like posts");
      return;
    }
    try {
      const action = post.liked ? "unlike" : "like";
      const data = await likePost(postId, action, token);
      if (data.post) {
        setPost(data.post);
      }
    } catch (err) {
      setError("Error liking post: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="error-message">Post not found</div>
      </div>
    );
  }

  const isOwner = post.creator === username;

  return (
    <div className="post-detail-container">
      <div className="container">
        {!isEditing ? (
          <div className="post-detail-card">
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-meta">
              <span className="meta-author">By {post.creator}</span>
              <span className="meta-divider">•</span>
              <span className="meta-date">{new Date(post.createdAt).toLocaleString()}</span>
            </div>

            <div className="post-content">
              {post.message}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, i) => (
                  <span key={i} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="post-actions">
              <button onClick={handleLike} className="like-button-detail">
                <span className="like-icon">♡</span>
                <span>{post.likeCount || 0} Likes</span>
              </button>

              {isOwner && (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                    Edit
                  </button>
                  <button onClick={handleDelete} className="btn btn-delete">
                    Delete
                  </button>
                </>
              )}
              
              <button onClick={() => nav("/")} className="btn btn-secondary">
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="post-detail-card">
            <h2 className="edit-form-title">Edit Poem</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Poem title..."
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                placeholder="Your poem..."
                value={editForm.content}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                rows="12"
              />
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="love, nature, inspiration"
                value={editForm.tags}
                onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
              />
            </div>
            <div className="btn-group">
              <button onClick={handleUpdate} className="btn btn-success">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}