// src/api.js
// ✅ FIXED: Use /api prefix with explicit base URL
const API_BASE_URL = "https://dead-poets-society-backend.onrender.com";

export const API = API_BASE_URL;

export const authHeaders = (token) => 
  token ? { Authorization: `Bearer ${token}` } : {};

// ============================================
// 🔐 AUTHENTICATION ENDPOINTS
// ============================================

export const registerUser = async (userData) => {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const getUserProfile = async (token) => {
  const response = await fetch(`${API}/auth/profile`, {
    headers: authHeaders(token),
  });
  return response.json();
};

export const verifyToken = async (token) => {
  const response = await fetch(`${API}/auth/verify`, {
    headers: authHeaders(token),
  });
  return response.json();
};

export const updateUserProfile = async (profileData, token) => {
  const response = await fetch(`${API}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(profileData),
  });
  return response.json();
};

export const changePassword = async (passwordData, token) => {
  const response = await fetch(`${API}/auth/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(passwordData),
  });
  return response.json();
};

export const deleteUserAccount = async (token) => {
  const response = await fetch(`${API}/auth/profile`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return response.json();
};

// ============================================
// 📝 POST ENDPOINTS
// ============================================

export const createPost = async (postData, token) => {
  const response = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(postData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.details || "Failed to create post");
  }
  return data;
};

export const getAllPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`${API}/posts?page=${page}&limit=${limit}`);
  return response.json();
};

export const getPostById = async (postId) => {
  const response = await fetch(`${API}/posts/${postId}`);
  return response.json();
};

export const updatePost = async (postId, postData, token) => {
  const response = await fetch(`${API}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(postData),
  });
  return response.json();
};

export const deletePost = async (postId, token) => {
  const response = await fetch(`${API}/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return response.json();
};

export const likePost = async (postId, action = "like", token) => {
  const response = await fetch(`${API}/posts/${postId}/like`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ action }),
  });
  return response.json();
};
