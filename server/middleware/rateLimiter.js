import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login attempts
 * 5 requests per 15 minutes per IP
 * Prevents brute force password guessing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many login attempts, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Don't count requests from localhost in development
    return process.env.NODE_ENV !== "production" && (req.ip === "::1" || req.ip === "127.0.0.1");
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many attempts",
      message: "Too many login attempts. Please try again in 15 minutes.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * General rate limiter for all endpoints
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health check
    return req.path === "/health";
  },
});

/**
 * Rate limiter for post creation
 * 10 posts per hour per authenticated user
 * Prevents spam content
 */
export const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 posts per hour
  skipSuccessfulRequests: false, // Count both success and failure
  message: "Too many posts created. Please try again later.",
  // Don't use custom keyGenerator for rate limiting by user ID
});

/**
 * Rate limiter for registration
 * 5 registrations per hour per IP
 * Prevents account creation spam
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour
  message: "Too many accounts created from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password change
 * 3 attempts per hour per user
 */
export const changePasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: "Too many password change attempts. Please try again later.",
  // Don't use custom keyGenerator
});
