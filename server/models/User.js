import mongoose from "mongoose";

/**
 * User Schema
 * Defines the structure of a User document in MongoDB
 * 
 * Fields:
 * - username: Unique user identifier (required, string)
 * - email: User email address (required, unique, string)
 * - password: Hashed password (required, string)
 * - createdAt: Auto-generated timestamp when user is created
 * - updatedAt: Auto-generated timestamp when user is updated
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't return password by default in queries
    },
  },
  { 
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: "users", // Explicit collection name
  }
);

/**
 * Model: User
 * Used to interact with the 'users' collection in MongoDB
 */
const User = mongoose.model("User", userSchema);

export default User;
