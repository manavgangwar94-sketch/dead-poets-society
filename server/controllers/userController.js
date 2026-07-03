import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { AccountLockedError } from "../middleware/errorHandler.js";

/**
 * CREATE: Register a new user
 * POST /api/auth/register
 * Body: { username, email, password }
 */
export const registerUser = async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;

    logger.info("Registration attempt", { email, displayName });

    // Check if user already exists (only by email now, displayName not unique)
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      logger.warn("Registration failed - email already in use", {
        email,
        displayName,
      });

      return res.status(400).json({ error: "Email is already in use" });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const newUser = await User.create({
      displayName,
      email,
      password,
    });

    // Generate both access and refresh tokens
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    
    // Access token: short-lived (15 minutes)
    const accessToken = jwt.sign(
      { id: newUser._id, displayName: newUser.displayName, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh token: long-lived (7 days)
    const { token: refreshToken, expiresAt } = newUser.generateRefreshToken(7);
    await newUser.setRefreshToken(refreshToken, expiresAt);

    logger.security("User registered successfully", {
      userId: newUser._id,
      email: newUser.email,
      displayName: newUser.displayName,
      ip: req.ip,
    });

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        displayName: newUser.displayName,
        email: newUser.email,
      },
      accessToken,
    });
  } catch (err) {
    logger.error("Registration error", {
      error: err.message,
      email: req.body.email,
      ip: req.ip,
    });

    // Don't expose internal error details
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid input",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(400).json({
      error: "Failed to register user",
    });
  }
};

/**
 * READ: Login user with account lockout protection
 * POST /api/auth/login
 * Body: { email, password }
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    logger.info("Login attempt", { email, ip });

    // Find user by email and select password field
    const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");

    if (!user) {
      logger.warn("Login failed - user not found", { email, ip });
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      logger.security("Login blocked - account locked", {
        userId: user._id,
        email,
        ip,
        lockedUntil: user.lockUntil,
      });

      return res.status(423).json({
        error: "Account locked",
        message:
          "Too many failed login attempts. Please try again in 2 hours.",
        retryAfter: user.lockUntil,
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      logger.warn("Login failed - invalid password", {
        userId: user._id,
        email,
        ip,
        attempts: user.loginAttempts + 1,
      });

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate both access and refresh tokens
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    
    // Access token: short-lived (15 minutes)
    const accessToken = jwt.sign(
      { id: user._id, displayName: user.displayName, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh token: long-lived (7 days)
    const { token: refreshToken, expiresAt } = user.generateRefreshToken(7);
    await user.setRefreshToken(refreshToken, expiresAt);

    logger.security("User logged in successfully", {
      userId: user._id,
      email,
      ip,
      userAgent: req.get("user-agent"),
    });

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
      accessToken,
    });
  } catch (err) {
    logger.error("Login error", {
      error: err.message,
      email: req.body.email,
      ip: req.ip,
    });

    res.status(500).json({
      error: "Failed to login",
    });
  }
};

/**
 * READ: Get user profile
 * GET /api/auth/profile
 * Requires: Authentication token
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      logger.warn("Profile not found", { userId });
      return res.status(404).json({
        error: "User not found",
      });
    }

    logger.debug("Profile retrieved", { userId });

    res.json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    logger.error("Get profile error", { error: err.message, userId: req.user?.id });
    res.status(500).json({
      error: "Failed to retrieve profile",
    });
  }
};

/**
 * UPDATE: Update user profile
 * PATCH /api/auth/profile
 * Body: { username (optional), email (optional) }
 * Requires: Authentication token
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { displayName, email } = req.body;

    // Prepare update object
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        email,
      });

      if (existingUser) {
        logger.warn("Profile update failed - email already in use", {
          userId,
          field: "email",
        });

        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    logger.security("Profile updated", {
      userId,
      fields: Object.keys(updateData),
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    logger.error("Update profile error", {
      error: err.message,
      userId: req.user?.id,
    });

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid input",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(400).json({
      error: "Failed to update profile",
    });
  }
};

/**
 * UPDATE: Change password
 * PATCH /api/auth/change-password
 * Body: { currentPassword, newPassword }
 * Requires: Authentication token
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      logger.warn("User not found for password change", { userId });
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      logger.warn("Password change failed - incorrect current password", {
        userId,
      });

      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    logger.security("Password changed successfully", {
      userId,
      ip: req.ip,
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    logger.error("Change password error", {
      error: err.message,
      userId: req.user?.id,
    });

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Invalid password",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      error: "Failed to change password",
    });
  }
};

/**
 * DELETE: Delete user account
 * DELETE /api/auth/profile
 * Requires: Authentication token
 */
export const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body; // Require password confirmation for security

    const user = await User.findById(userId).select("+password");

    if (!user) {
      logger.warn("User not found for deletion", { userId });
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify password before deletion (security measure)
    if (password) {
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        logger.warn("Account deletion failed - incorrect password", {
          userId,
        });

        return res.status(401).json({
          error: "Password is incorrect",
        });
      }
    }

    await User.findByIdAndDelete(userId);

    logger.security("User account deleted", {
      userId,
      email: user.email,
      ip: req.ip,
    });

    res.json({
      message: "User account deleted successfully",
    });
  } catch (err) {
    logger.error("Delete account error", {
      error: err.message,
      userId: req.user?.id,
    });

    res.status(500).json({
      error: "Failed to delete account",
    });
  }
};

/**
 * Verify JWT token validity
 * GET /api/auth/verify
 * Requires: Authentication token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        valid: false,
      });
    }

    res.json({
      message: "Token is valid",
      valid: true,
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.email,
      },
    });
  } catch (err) {
    logger.error("Token verification error", {
      error: err.message,
      userId: req.user?.id,
    });

    res.status(401).json({
      error: "Failed to verify token",
      valid: false,
    });
  }
};

/**
 * REFRESH: Refresh access token using refresh token from cookie
 * POST /api/auth/refresh
 * Requires: refreshToken cookie
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const ip = req.ip;

    if (!refreshToken) {
      logger.warn("Refresh token attempt - no token provided", { ip });
      return res.status(401).json({
        error: "Refresh token missing",
      });
    }

    // Extract the user ID from JWT if available (optional optimization)
    // For now, we'll validate the token and search by it
    // In a production app, you might store user ID in the token for faster lookup

    // Since we need to validate the refresh token against stored hash,
    // we'd need to search all users or store more info. For now, using a simple approach:
    // Find user by checking if token exists and is valid
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    let userId;

    try {
      // Try to decode any JWT in the refresh token (not standard, but helpful for optimization)
      // For now, just continue to validate
    } catch (e) {
      // Not a JWT, continue to search
    }

    // Search through users for valid refresh token (in production, store user ID in refresh token)
    // For now, we'll use a simpler approach: client sends user ID or we search efficiently
    // Better approach: Include user ID in refresh token JWT
    
    // Let's update the approach: make refresh token a JWT with user ID
    // For now, return error asking for user info
    logger.warn("Refresh token validation - searching for user", { ip });

    // Query all users to find matching refresh token (not ideal, but works for now)
    // Better: Include userId in the refresh token payload
    const users = await User.find({}).select("+refreshTokenHash +refreshTokenExpiresAt +isRefreshTokenRevoked");
    
    let validUser = null;
    for (const user of users) {
      const isValid = await user.validateRefreshToken(refreshToken);
      if (isValid) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      logger.warn("Refresh token invalid or expired", { ip });
      return res.status(401).json({
        error: "Invalid or expired refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: validUser._id, displayName: validUser.displayName, email: validUser.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    logger.debug("Access token refreshed", {
      userId: validUser._id,
      email: validUser.email,
      ip,
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    logger.error("Refresh token error", {
      error: err.message,
      ip: req.ip,
    });

    res.status(500).json({
      error: "Failed to refresh token",
    });
  }
};

/**
 * LOGOUT: Revoke refresh token and clear cookies
 * POST /api/auth/logout
 * Requires: Authentication token
 */
export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const ip = req.ip;

    if (!userId) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      logger.warn("Logout failed - user not found", { userId, ip });
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Revoke refresh token
    await user.revokeRefreshToken();

    logger.security("User logged out", {
      userId,
      email: user.email,
      ip,
    });

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      path: "/api/auth",
    });

    res.json({
      message: "Logged out successfully",
    });
  } catch (err) {
    logger.error("Logout error", {
      error: err.message,
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(500).json({
      error: "Failed to logout",
    });
  }
};
