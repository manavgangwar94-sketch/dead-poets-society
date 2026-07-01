/**
 * Session Recovery & Token Verification
 * Runs on app startup to ensure token is valid
 */

export const initializeAuth = async () => {
  console.log("🔐 [Auth] Initializing authentication system...");
  
  const token = localStorage.getItem("token");
  const displayName = localStorage.getItem("displayName");

  console.log("🔐 [Auth] Current state:");
  console.log("   Token present:", !!token);
    console.log("   Display Name present:", !!displayName);
  console.log("   localStorage keys:", Object.keys(localStorage));

  if (token) {
    console.log("🔐 [Auth] Token found in storage");
    console.log("🔐 [Auth] Token preview:", token.substring(0, 50) + "...");
    console.log("🔐 [Auth] Token length:", token.length);
    
    // Try to verify token with backend
    try {
      const response = await fetch("https://dead-poets-society-backend.onrender.com/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("✅ [Auth] Token verified with backend");
        return { authenticated: true, token, displayName };
      } else {
        console.warn("⚠️ [Auth] Token verification failed - might be expired");
        localStorage.removeItem("token");
        localStorage.removeItem("displayName");
        return { authenticated: false };
      }
    } catch (err) {
      console.error("❌ [Auth] Error verifying token:", err.message);
      // Token might still be valid, don't clear it
      return { authenticated: true, token, displayName };
    }
  } else {
    console.log("🔐 [Auth] No token in storage - user not authenticated");
    return { authenticated: false };
  }
};

export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ [Auth] getAuthToken() called but token is missing!");
    console.warn("   Available keys:", Object.keys(localStorage));
  }
  return token;
};

export const setAuthToken = (token, displayName) => {
  console.log("🔐 [Auth] setAuthToken called");
  console.log("   Token length:", token?.length);
  console.log("   Display Name:", displayName);
  
  if (!token) {
    console.error("❌ [Auth] Cannot set empty token!");
    return false;
  }

  try {
    localStorage.setItem("token", token);
    localStorage.setItem("displayName", displayName);
    
    // Verify
    const verify = localStorage.getItem("token");
    if (verify === token) {
      console.log("✅ [Auth] Token stored and verified");
      return true;
    } else {
      console.error("❌ [Auth] Token storage verification failed!");
      return false;
    }
  } catch (err) {
    console.error("❌ [Auth] Error storing token:", err.message);
    return false;
  }
};

export const clearAuth = () => {
  console.log("🚪 [Auth] Clearing authentication");
  localStorage.removeItem("token");
  localStorage.removeItem("displayName");
  console.log("✅ [Auth] Authentication cleared");
};
