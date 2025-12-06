import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  deleteAllPosts,
} from "../controllers/postController.js";

const router = express.Router();

/**
 * POST /api/posts
 * CREATE: Add a new post
 * Protected route (requires authentication)
 * Body: { title, message, creator, tags (optional) }
 */
router.post("/", auth, createPost);

/**
 * GET /api/posts
 * READ: Retrieve all posts with pagination
 * Public route
 * Query params: page=1, limit=10, tags=poetry
 */
router.get("/", getPosts);

/**
 * GET /api/posts/:id
 * READ: Retrieve a specific post by ID
 * Public route
 */
router.get("/:id", getPostById);

/**
 * PATCH /api/posts/:id
 * UPDATE: Modify an existing post
 * Protected route (requires authentication)
 * Body: { title, message, tags } (can update any/all fields)
 */
router.patch("/:id", auth, updatePost);

/**
 * PATCH /api/posts/:id/like
 * UPDATE: Like/Unlike a post
 * Protected route (requires authentication)
 * Body: { action: "like" or "unlike" }
 */
router.patch("/:id/like", auth, likePost);

/**
 * DELETE /api/posts/:id
 * DELETE: Remove a specific post
 * Protected route (requires authentication)
 */
router.delete("/:id", auth, deletePost);

/**
 * DELETE /api/posts
 * DELETE: Remove all posts (Admin operation)
 * Protected route (requires authentication)
 * WARNING: This is a destructive operation!
 */
router.delete("/", auth, deleteAllPosts);

export default router;


