import jwt from "jsonwebtoken";

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Adds decoded user info to req.user
 */
export function auth(req, res, next) {
  const header = req.headers.authorization; // "Bearer token"
  
  console.log(`[AUTH] Authorization header: ${header ? "Present" : "Missing"}`);

  if (!header) {
    console.log("[AUTH] ❌ No authorization header");
    return res.status(401).json({
      error: "Unauthorized",
      message: "No authorization token provided",
    });
  }

  const parts = header.split(" ");
  const token = parts[1];

  console.log(`[AUTH] Header format: ${parts[0]} ...${token ? token.substring(0, 20) : "MISSING"}`);

  if (!token) {
    console.log("[AUTH] ❌ Invalid authorization header format");
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authorization header format. Use: Bearer <token>",
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    console.log(`[AUTH] Attempting to verify token...`);
    console.log(`[AUTH] JWT_SECRET first 20 chars: ${JWT_SECRET.substring(0, 20)}`);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[AUTH] ✅ Token verified for user: ${decoded.username}`);
    req.user = decoded; // { id, username, email }
    next();
  } catch (err) {
    console.error(`[AUTH] ❌ Token verification failed: ${err.message}`);
    if (err.message === "invalid signature") {
      console.error("[AUTH] 💡 Token was signed with a different JWT_SECRET!");
      console.error("[AUTH] 💡 Try registering a new account or logging in again");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token Expired",
        message: "Please login again",
      });
    }
    return res.status(401).json({
      error: "Unauthorized",
      message: err.message === "invalid signature" 
        ? "Invalid token signature - please login again"
        : "Invalid token",
    });
  }
}

