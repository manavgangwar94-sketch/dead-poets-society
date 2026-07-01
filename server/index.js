// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// Import routes
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";

// Import security middleware
import {
  authLimiter,
  generalLimiter,
  registerLimiter,
} from "./middleware/rateLimiter.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet for security headers (prevents common attacks)
app.use(helmet());

// 2. Body parsing with size limits (prevents large payload attacks)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 3. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 4. CORS Configuration (prevents unauthorized API access)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://dead-poets-society-frontend.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 5. General rate limiting for all endpoints
app.use(generalLimiter);

// ============================================
// REQUEST LOGGING
// ============================================

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV || "development";

// Validate required environment variables
if (!MONGO_URI) {
  logger.error("❌ MONGO_URI is not set in environment variables");
  process.exit(1);
}

if (!JWT_SECRET || JWT_SECRET === "devsecret") {
  logger.warn("⚠️ JWT_SECRET is using default value. Change this in production!");
}

logger.info("🚀 Server Configuration", {
  environment: NODE_ENV,
  mongoConnected: "Connecting...",
  port: PORT,
});

// ============================================
// HEALTH & ROOT ENDPOINTS
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Dead Poets Society API v2.0 - Secure Edition",
    environment: NODE_ENV,
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      health: "/health",
    },
    security: {
      helmet: "Enabled",
      rateLimit: "Enabled",
      mongoSanitize: "Enabled",
      cors: "Enabled",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// ============================================
// ROUTES
// ============================================

// Auth routes with rate limiting
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth", authRoutes);

// Posts routes
app.use("/api/posts", postsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        environment: NODE_ENV,
        baseUrl: `http://localhost:${PORT}`,
      });

      logger.info("📚 Available Endpoints:", {
        health: `http://localhost:${PORT}/health`,
        auth: `http://localhost:${PORT}/api/auth`,
        posts: `http://localhost:${PORT}/api/posts`,
      });

      logger.security("🔒 Security Features Enabled:", {
        helmet: "Yes",
        rateLimit: "Yes",
        mongoSanitize: "Yes",
        cors: "Yes",
        logging: "Yes",
      });
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection failed", {
      error: err.message,
    });
    process.exit(1);
  });

export default app;