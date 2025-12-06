// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔍 REQUEST LOGGER (helps debug incoming requests)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method.toUpperCase()} ${req.path}`);
  next();
});

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

console.log("🔌 MONGO_URI from env:", MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("🔑 JWT_SECRET from env:", JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("🔑 JWT_SECRET value (first 20 chars):", JWT_SECRET.substring(0, 20));
console.log("🔑 JWT_SECRET full:", JWT_SECRET);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Dead Poets Society API is running",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
    },
  });
});

// 🚀 Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is healthy", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  console.warn(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Not Found",
    message: `The route ${req.method} ${req.path} does not exist`,
    availableRoutes: {
      auth: "/api/auth/register",
      posts: "/api/posts",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
