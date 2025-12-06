import express from "express";
import { auth } from "../middleware/auth.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  verifyToken,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * CREATE: Register a new user
 * Public route
 * Body: { username, email, password }
 */
router.post("/register", registerUser);

/**
 * POST /api/auth/login
 * READ: Login user
 * Public route
 * Body: { email, password }
 */
router.post("/login", loginUser);

/**
 * GET /api/auth/profile
 * READ: Get user profile
 * Protected route (requires authentication)
 */
router.get("/profile", auth, getUserProfile);

/**
 * PATCH /api/auth/profile
 * UPDATE: Update user profile
 * Protected route (requires authentication)
 * Body: { username (optional), email (optional) }
 */
router.patch("/profile", auth, updateUserProfile);

/**
 * PATCH /api/auth/change-password
 * UPDATE: Change user password
 * Protected route (requires authentication)
 * Body: { currentPassword, newPassword }
 */
router.patch("/change-password", auth, changePassword);

/**
 * DELETE /api/auth/profile
 * DELETE: Delete user account
 * Protected route (requires authentication)
 */
router.delete("/profile", auth, deleteUserAccount);

/**
 * GET /api/auth/verify
 * READ: Verify JWT token validity
 * Protected route (requires authentication)
 */
router.get("/verify", auth, verifyToken);

export default router;


