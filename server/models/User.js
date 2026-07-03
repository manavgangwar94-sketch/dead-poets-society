import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ACCOUNT_SECURITY } from "../utils/constants.js";

/**
 * User Schema with Enhanced Security
 * Includes account lockout tracking, login attempts, and better validation
 */
const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      minlength: [2, "Display name must be at least 2 characters long"],
      maxlength: [50, "Display name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Never return password in queries by default
    },
    // Account security fields
    loginAttempts: {
      type: Number,
      default: 0,
      select: false, // Don't return in normal queries
    },
    // lock untill a certain time after max login attempts is reached the 
    lockUntil: {
      type: Date,
      default: null,
      select: false, // Don't return in normal queries
    },
    // track last login time for securty and useer activity monitoring 
    
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    // Refresh token fields for dual-token authentication
    refreshTokenHash: {
      type: String,
      default: null,
      select: false, // Don't return in normal queries
    },
    refreshTokenExpiresAt: {
      type: Date,
      default: null,
      select: false, // Don't return in normal queries
    },
    isRefreshTokenRevoked: {
      type: Boolean,
      default: false,
      select: false, // Don't return in normal queries
    },
  },
  { 
    timestamps: true,
    collection: "users",
  }
);

/**
 * Pre-save middleware: Hash password before storing
 * Only hash if password is modified/new
 */
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12); // 12 rounds for security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Method to compare entered password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to check if account is currently locked
 * @returns {boolean} - True if account is locked
 */
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Method to record failed login attempt
 * Locks account after MAX_LOGIN_ATTEMPTS attempts
 * @returns {Promise} - Update result
 */
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
        lockUntil: null,
      },
    });
  }

  // Increment login attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after MAX_LOGIN_ATTEMPTS failed attempts
  if (
    this.loginAttempts + 1 >= ACCOUNT_SECURITY.MAX_LOGIN_ATTEMPTS &&
    !this.isAccountLocked()
  ) {
    const lockTime = ACCOUNT_SECURITY.LOCK_TIME_HOURS * 60 * 60 * 1000;
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }

  return this.updateOne(updates);
};

/**
 * Method to reset login attempts after successful login
 * @returns {Promise} - Update result
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    },
  });
};

/**
 * Method to generate a new refresh token
 * @param {number} expiresInDays - Token expiration in days (default: 7)
 * @returns {Object} - { token: string, expiresAt: Date }
 */
userSchema.methods.generateRefreshToken = function (expiresInDays = 7) {
  // Generate a random refresh token using crypto
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  
  return { token, expiresAt };
};

/**
 * Method to set and hash refresh token
 * @param {string} token - Raw refresh token
 * @param {Date} expiresAt - Expiration date
 * @returns {Promise} - Update result
 */
userSchema.methods.setRefreshToken = async function (token, expiresAt) {
  // Hash the refresh token like a password
  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(token, salt);
  
  return this.updateOne({
    $set: {
      refreshTokenHash,
      refreshTokenExpiresAt: expiresAt,
      isRefreshTokenRevoked: false,
    },
  });
};

/**
 * Method to validate refresh token
 * @param {string} token - Raw refresh token to validate
 * @returns {Promise<boolean>} - True if token is valid
 */
userSchema.methods.validateRefreshToken = async function (token) {
  // Check if token is revoked
  if (this.isRefreshTokenRevoked) {
    return false;
  }
  
  // Check if token has expired
  if (!this.refreshTokenExpiresAt || this.refreshTokenExpiresAt < new Date()) {
    return false;
  }
  
  // Compare token hash
  if (!this.refreshTokenHash) {
    return false;
  }
  
  return bcrypt.compare(token, this.refreshTokenHash);
};

/**
 * Method to revoke refresh token (logout)
 * @returns {Promise} - Update result
 */
userSchema.methods.revokeRefreshToken = async function () {
  return this.updateOne({
    $set: {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
      isRefreshTokenRevoked: true,
    },
  });
};

/**
 * Model: User
 */
const User = mongoose.model("User", userSchema);

export default User;
