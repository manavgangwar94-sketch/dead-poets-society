import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * CREATE: Register a new user
 * POST /api/auth/register
 * Body: { username, email, password }
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["username", "email", "password"],
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email 
          ? "Email is already in use" 
          : "Username is already taken",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({
      error: "Failed to register user",
      details: err.message,
    });
  }
};

/**
 * READ: Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["email", "password"],
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Failed to login",
      details: err.message,
    });
  }
};

/**
 * READ: Get user profile
 * GET /api/auth/profile
 * Requires: Authentication token
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      error: "Failed to retrieve profile",
      details: err.message,
    });
  }
};

/**
 * UPDATE: Update user profile
 * PATCH /api/auth/profile
 * Body: { username (optional), email (optional) }
 * Requires: Authentication token
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username, email } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Prepare update object
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId }, // Exclude current user
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          error: existingUser.username === username 
            ? "Username is already taken" 
            : "Email is already in use",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(400).json({
      error: "Failed to update profile",
      details: err.message,
    });
  }
};

/**
 * UPDATE: Change password
 * PATCH /api/auth/change-password
 * Body: { currentPassword, newPassword }
 * Requires: Authentication token
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["currentPassword", "newPassword"],
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      error: "Failed to change password",
      details: err.message,
    });
  }
};

/**
 * DELETE: Delete user account
 * DELETE /api/auth/profile
 * Requires: Authentication token
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User account deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({
      error: "Failed to delete account",
      details: err.message,
    });
  }
};

/**
 * Verify JWT token
 * GET /api/auth/verify
 * Requires: Authentication token
 */
export const verifyToken = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        valid: false,
      });
    }

    res.json({
      message: "Token is valid",
      valid: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error("Verify token error:", err);
    res.status(401).json({
      error: "Failed to verify token",
      valid: false,
      details: err.message,
    });
  }
};
