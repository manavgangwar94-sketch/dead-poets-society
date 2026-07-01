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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "A post can have maximum 5 tags",
      },
    },
  },
  {
    timestamps: true,
    collection: "posts",
  }
);


const Post = mongoose.model("Post", postSchema);

export default Post;
