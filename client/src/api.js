// src/api.js
// ✅ FIXED: Use /api prefix with explicit base URL
import { refreshAccessToken, clearAuth, getAuthToken } from "./auth.js";

const API_BASE_URL = "https://dead-poets-society-backend.onrender.com/api";

export const API = API_BASE_URL;

// Queue for pending requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

export const authHeaders = (token) => 
  token ? { Authorization: `Bearer ${token}` } : {};

/**
 * Wrapped fetch with auto-refresh on token expiration
 * Handles 401 + X-Token-Expired header by automatically refreshing token
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {string} token - Current access token (optional for auto-refresh)
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (url, options = {}, token = null) => {
  let response = await fetch(url, options);

  // Check if token expired
  if (response.status === 401 && response.headers.get("X-Token-Expired") === "true") {
    console.log("🔄 [API] Token expired, attempting refresh...");

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        // Retry with new token
        options.headers = options.headers || {};
        options.headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, options);
      });
    }

    isRefreshing = true;

    try {
      // Attempt refresh
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        console.log("✅ [API] Token refreshed, retrying request");
        const newToken = getAuthToken();
        processQueue(null, newToken);

        // Retry original request with new token
        options.headers = options.headers || {};
        options.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, options);
      } else {
        console.warn("❌ [API] Token refresh failed - user must login again");
        processQueue(new Error("Refresh failed"), null);
        clearAuth();
        // Redirect to login would happen in component
      }
    } catch (err) {
      console.error("❌ [API] Error during refresh:", err.message);
      processQueue(err, null);
      clearAuth();
    }
  }

  return response;
};

// ============================================
// 🔐 AUTHENTICATION ENDPOINTS
// ============================================

export const registerUser = async (userData) => {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Include cookies for refresh token
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  
  // Update response format: 'token' -> 'accessToken'
  if (data.accessToken && !data.token) {
    data.token = data.accessToken;
  }
  
  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Include cookies for refresh token
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  
  // Update response format: 'token' -> 'accessToken'
  if (data.accessToken && !data.token) {
    data.token = data.accessToken;
  }
  
  return data;
};

export const getUserProfile = async (token) => {
  const response = await authenticatedFetch(`${API}/auth/profile`, {
    headers: authHeaders(token),
    credentials: "include",
  }, token);
  return response.json();
};

export const verifyToken = async (token) => {
  const response = await authenticatedFetch(`${API}/auth/verify`, {
    headers: authHeaders(token),
    credentials: "include",
  }, token);
  return response.json();
};

export const updateUserProfile = async (profileData, token) => {
  const response = await authenticatedFetch(`${API}/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  }, token);
  return response.json();
};

export const changePassword = async (passwordData, token) => {
  const response = await authenticatedFetch(`${API}/auth/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
    body: JSON.stringify(passwordData),
  }, token);
  return response.json();
};

export const deleteUserAccount = async (token) => {
  const response = await authenticatedFetch(`${API}/auth/profile`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  }, token);
  return response.json();
};

export const logoutUser = async (token) => {
  const response = await authenticatedFetch(`${API}/auth/logout`, {
    method: "POST",
    headers: authHeaders(token),
    credentials: "include",
  }, token);
  return response.json();
};

// ============================================
// 📝 POST ENDPOINTS
// ============================================

export const createPost = async (postData, token) => {
  const response = await authenticatedFetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
    body: JSON.stringify(postData),
  }, token);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.details || "Failed to create post");
  }
  return data;
};

export const getAllPosts = async (page = 1, limit = 10) => {
  const response = await fetch(`${API}/posts?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return response.json();
};

export const getPostById = async (postId) => {
  const response = await fetch(`${API}/posts/${postId}`, {
    credentials: "include",
  });
  return response.json();
};

export const updatePost = async (postId, postData, token) => {
  const response = await authenticatedFetch(`${API}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
    body: JSON.stringify(postData),
  }, token);
  return response.json();
};

export const deletePost = async (postId, token) => {
  const response = await authenticatedFetch(`${API}/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  }, token);
  return response.json();
};

export const likePost = async (postId, action = "like", token) => {
  const response = await authenticatedFetch(`${API}/posts/${postId}/like`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
    body: JSON.stringify({ action }),
  }, token);
  return response.json();
};
