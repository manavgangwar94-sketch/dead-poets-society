import React, { useEffect, useState } from "react";
import { getAllPosts, likePost } from "../api";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPosts(1, 10);
      const postsData = data.posts || data || [];
      
      // Check which posts are liked from localStorage
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      const postsWithLikedStatus = postsData.map(post => ({
        ...post,
        liked: likedPosts.includes(post._id)
      }));
      
      setPosts(postsWithLikedStatus);
    } catch (err) { 
      console.error(err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId, e) {
    e.preventDefault();
    if (!token) {
      alert("Please login to like posts");
      return;
    }
    
    try {
      // Get liked posts from localStorage
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      const hasLiked = likedPosts.includes(postId);
      
      // Determine action
      const action = hasLiked ? "unlike" : "like";
      
      // Call API
      const data = await likePost(postId, action, token);
      
      if (data.post || data) {
        // Update localStorage
        if (action === "like") {
          likedPosts.push(postId);
        } else {
          const index = likedPosts.indexOf(postId);
          if (index > -1) likedPosts.splice(index, 1);
        }
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        
        // Update state with new like count and liked status
        setPosts(posts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                likeCount: action === "like" ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1),
                liked: action === "like"
              } 
            : p
        ));
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  }

  const cardColors = [
    'card-cream',
    'card-rose',
    'card-sage',
    'card-lavender',
    'card-peach'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading poems...</p>
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

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Dead Poets Society</h1>
          <p className="hero-subtitle">Where words dance and hearts speak</p>
          <Link to="/create" className="btn btn-hero">
            <span className="btn-icon"></span>
            Write a Poem
          </Link>
        </div>
      </div>

      <div className="container">
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h2>No poems yet</h2>
            <p>Be the first to share your verses with the world</p>
            <Link to="/create" className="btn btn-primary">Start Writing</Link>
          </div>
        ) : (
          <div className="masonry-grid">
            {posts.map((p, index) => {
              const colorClass = cardColors[index % cardColors.length];
              return (
                <div key={p._id || p.id} className={`poem-card ${colorClass}`}>
                  <Link to={`/post/${p._id}`} className="card-link">
                    <h2 className="card-title">{p.title}</h2>
                  </Link>
                  
                  <div className="card-meta">
                    <span className="meta-author">By {p.creator}</span>
                    <span className="meta-divider">•</span>
                    <span className="meta-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="card-content">
                    {p.message?.substring(0, 150) || p.content?.substring(0, 150)}...
                  </p>

                  {p.tags && p.tags.length > 0 && (
                    <div className="card-tags">
                      {p.tags.map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="card-footer">
                    <button 
                      onClick={(e) => handleLike(p._id, e)}
                      className={`like-button ${p.liked ? 'liked' : ''}`}
                      aria-label="Like post"
                    >
                      <span className="like-icon">{p.liked ? '♥' : '♡'}</span>
                      <span className="like-count">{p.likeCount || 0}</span>
                    </button>
                    
                    <Link to={`/post/${p._id}`} className="btn btn-view">
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}