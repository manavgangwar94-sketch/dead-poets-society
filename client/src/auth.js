/**
 * In-Memory Token Storage
 * Access token stored in memory (cleared on page refresh)
 * Refresh token stored in HttpOnly cookie (persistent, handled by browser)
 */

let accessToken = null;
let displayName = null;
let userId = null;

/**
 * Session Recovery & Token Verification
 * Runs on app startup to refresh access token using stored cookie
 */
export const initializeAuth = async () => {
  console.log("🔐 [Auth] Initializing authentication system...");
  
  try {
    // Attempt to refresh access token using stored refresh token cookie
    const response = await fetch(
      "https://dead-poets-society-backend.onrender.com/api/auth/refresh",
      {
        method: "POST",
        credentials: "include", // Send cookies with request
      }
    );

    if (response.ok) {
      const data = await response.json();
      const { accessToken: newAccessToken } = data;
      
      // Get displayName from any remaining source (could add to refresh response)
      // For now, we'll retrieve it from profile
      console.log("✅ [Auth] Access token refreshed from cookie");
      
      // Verify token by getting profile
      try {
        const profileResponse = await fetch(
          "https://dead-poets-society-backend.onrender.com/api/auth/profile",
          {
            headers: {
              "Authorization": `Bearer ${newAccessToken}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setAuthToken(newAccessToken, profileData.user.displayName, profileData.user.id);
          console.log("✅ [Auth] User authenticated and profile loaded");
          return { authenticated: true, token: newAccessToken, displayName: profileData.user.displayName, userId: profileData.user.id };
        }
      } catch (err) {
        console.error("❌ [Auth] Error fetching profile:", err.message);
      }
      
      return { authenticated: false };
    } else {
      console.warn("⚠️ [Auth] Refresh token invalid or expired - user not authenticated");
      clearAuth();
      return { authenticated: false };
    }
  } catch (err) {
    console.error("❌ [Auth] Error during auth initialization:", err.message);
    clearAuth();
    return { authenticated: false };
  }
};

export const getAuthToken = () => {
  if (!accessToken) {
    console.warn("⚠️ [Auth] getAuthToken() called but token is missing!");
    console.warn("   User not authenticated or page was refreshed");
  }
  return accessToken;
};

export const setAuthToken = (token, name, id) => {
  console.log("🔐 [Auth] setAuthToken called");
  console.log("   Token length:", token?.length);
  console.log("   Display Name:", name);
  console.log("   User ID:", id);
  
  if (!token) {
    console.error("❌ [Auth] Cannot set empty token!");
    return false;
  }

  try {
    accessToken = token;
    displayName = name;
    userId = id;
    console.log("✅ [Auth] Token stored in memory");
    return true;
  } catch (err) {
    console.error("❌ [Auth] Error storing token:", err.message);
    return false;
  }
};

export const clearAuth = () => {
  console.log("🚪 [Auth] Clearing authentication");
  accessToken = null;
  displayName = null;
  userId = null;
  console.log("✅ [Auth] Authentication cleared");
};

/**
 * Refresh Access Token
 * Uses refresh token from HttpOnly cookie to get a new access token
 * @returns {Promise<boolean>} - True if refresh successful
 */
export const refreshAccessToken = async () => {
  console.log("🔄 [Auth] Attempting to refresh access token...");
  
  try {
    const response = await fetch(
      "https://dead-poets-society-backend.onrender.com/api/auth/refresh",
      {
        method: "POST",
        credentials: "include", // Send refresh token cookie
      }
    );

    if (response.ok) {
      const data = await response.json();
      const { accessToken: newAccessToken } = data;
      
      // Update token in memory (keep displayName as is)
      accessToken = newAccessToken;
      console.log("✅ [Auth] Access token refreshed successfully");
      return true;
    } else {
      console.warn("⚠️ [Auth] Refresh token invalid - user must login again");
      clearAuth();
      return false;
    }
  } catch (err) {
    console.error("❌ [Auth] Error refreshing token:", err.message);
    clearAuth();
    return false;
  }
};

/**
 * Get Display Name
 * @returns {string|null} - User display name or null if not authenticated
 */
export const getDisplayName = () => {
  return displayName;
};

/**
 * Get User ID
 * @returns {string|null} - User ID or null if not authenticated
 */
export const getUserId = () => {
  return userId;
};
