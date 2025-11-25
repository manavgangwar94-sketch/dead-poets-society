// src/api.js
export const API = process.env.REACT_APP_API_URL || ""; // "" works if you added "proxy" to package.json
export const authHeaders = token => token ? { Authorization: `Bearer ${token}` } : {};
