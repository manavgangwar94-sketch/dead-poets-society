// Debug utility to check token and auth status
export const checkAuthStatus = () => {
  console.log("🔐 ===== AUTH STATUS CHECK =====");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  
  console.log("Token exists:", !!token);
  if (token) {
    console.log("Token (first 30 chars):", token.substring(0, 30) + "...");
    console.log("Token length:", token.length);
  } else {
    console.log("⚠️ Token is missing or null");
  }
  
  console.log("Username:", username);
  console.log("All localStorage keys:", Object.keys(localStorage));
  console.log("📍 Full localStorage content:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value?.substring ? value.substring(0, 50) + "..." : value);
  }
  console.log("🔐 ===== END AUTH STATUS CHECK =====");
};

export const testAPICall = async () => {
  console.log("🧪 Testing API call with token...");
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.error("❌ No token available");
    return;
  }
  
  try {
    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Test Post",
        message: "This is a test post to verify authentication",
        tags: ["test"],
      }),
    });
    
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
    return data;
  } catch (err) {
    console.error("Error during test:", err);
  }
};

// Auto-log on import
if (typeof window !== 'undefined') {
  window.checkAuthStatus = checkAuthStatus;
  window.testAPICall = testAPICall;
  console.log("🧪 Debug utilities loaded. Use window.checkAuthStatus() and window.testAPICall()");
}
