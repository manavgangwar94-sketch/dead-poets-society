import mongoose from "mongoose";

/**
 * Post Schema
 * Defines the structure of a Post document in MongoDB
 * Used for storing posts/poems created by users
 * 
 * Fields:
 * - title: Post title (required, string)
 * - message: Post content/body (required, string)
 * - creator: Author name or username (required, string)
 * - tags: Array of tags for categorization (optional, array)
 * - likeCount: Number of likes/upvotes (optional, defaults to 0)
 * - createdAt: Auto-generated timestamp when post is created
 * - updatedAt: Auto-generated timestamp when post is updated
 */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Post content (message) is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters long"],
    },
    creator: {
      type: String,
      required: [true, "Creator/author name is required"],
      trim: true,
      maxlength: [50, "Creator name cannot exceed 50 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5; // Max 5 tags per post
        },
        message: "A post can have maximum 5 tags",
      },
    },
    likeCount: {
      type: Number,
      default: 0,
      min: [0, "Like count cannot be negative"],
    },
  },
  { 
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: "posts", // Explicit collection name
  }
);


const Post = mongoose.model("Post", postSchema);

export default Post;
