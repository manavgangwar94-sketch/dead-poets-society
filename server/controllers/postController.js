import Post from "../models/Post.js";
import Like from "../models/Like.js";
import User from "../models/User.js";

/**
 * CREATE: Add a new post to the database
 * POST /api/posts
 * Body: { title, message (or content), tags (optional) }
 * Protected: Requires authentication
 */
export const createPost = async (req, res) => {
  try {
    const { title, message, content, tags } = req.body;
    const authorId = req.user?.id;

    // Validate required fields
    if (!title || (!message && !content)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["title", "message (or content)"],
      });
    }

    // Use message if provided, otherwise use content
    const postContent = message || content;

    // Create new post with author reference
    const newPost = await Post.create({
      title,
      message: postContent,
      author: authorId,
      tags: tags || [],
    });

    // Populate author info before returning
    const populatedPost = await newPost.populate("author", "displayName email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(400).json({
      error: "Failed to create post",
      details: err.message,
    });
  }
};

/**
 * READ: Get all posts
 * GET /api/posts
 * Optional query: page, limit (for pagination)
 */
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tags } = req.query;
    const skip = (page - 1) * limit;

    // Build filter query
    let filterQuery = {};
    if (tags) {
      filterQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    // Fetch posts with pagination, sorting, and populated author
    const posts = await Post.find(filterQuery)
      .populate("author", "displayName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Post.countDocuments(filterQuery);

    // For each post, count likes
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Like.countDocuments({ post: post._id });
        return {
          ...post.toObject(),
          likeCount,
        };
      })
    );

    res.json({
      message: "Posts retrieved successfully",
      posts: postsWithLikes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    res.status(500).json({
      error: "Failed to retrieve posts",
      details: err.message,
    });
  }
};

/**
 * READ: Get a single post by ID
 * GET /api/posts/:id
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid post ID format",
      });
    }

    const post = await Post.findById(id).populate("author", "displayName email");

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Count likes for this post
    const likeCount = await Like.countDocuments({ post: post._id });

    res.json({
      message: "Post retrieved successfully",
      post: {
        ...post.toObject(),
        likeCount,
      },
    });
  } catch (err) {
    console.error("Get post by ID error:", err);
    res.status(500).json({
      error: "Failed to retrieve post",
      details: err.message,
    });
  }
};

/**
 * UPDATE: Modify an existing post
 * PATCH /api/posts/:id
 * Can update: title, message, tags
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, tags } = req.body;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid post ID format",
      });
    }

    // Check if post exists
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Check ownership
    if (existingPost.author.toString() !== userId) {
      return res.status(403).json({
        error: "You can only update your own posts",
      });
    }

    // Prepare update object (only update fields that are provided)
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (tags !== undefined) updateData.tags = tags;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "displayName email");

    // Count likes
    const likeCount = await Like.countDocuments({ post: updatedPost._id });

    res.json({
      message: "Post updated successfully",
      post: {
        ...updatedPost.toObject(),
        likeCount,
      },
    });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(400).json({
      error: "Failed to update post",
      details: err.message,
    });
  }
};

/**
 * DELETE: Remove a post
 * DELETE /api/posts/:id
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid post ID format",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        error: "You can only delete your own posts",
      });
    }

    // Delete all likes for this post
    await Like.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.json({
      message: "Post deleted successfully",
      post,
    });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({
      error: "Failed to delete post",
      details: err.message,
    });
  }
};

/**
 * UPDATE: Like/Unlike a post
 * PATCH /api/posts/:id/like
 * Body: { action: "like" or "unlike" }
 */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid post ID format",
      });
    }

    // Validate action parameter
    if (!action || (action !== "like" && action !== "unlike")) {
      return res.status(400).json({
        error: "Invalid action. Use 'like' or 'unlike'",
      });
    }

    // Check if post exists
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
      user: userId,
      post: id,
    });

    if (action === "like") {
      if (existingLike) {
        return res.status(400).json({
          error: "You already liked this post",
        });
      }

      // Create a new like
      await Like.create({
        user: userId,
        post: id,
      });
    } else if (action === "unlike") {
      if (!existingLike) {
        return res.status(400).json({
          error: "You haven't liked this post",
        });
      }

      // Delete the like
      await Like.deleteOne({
        user: userId,
        post: id,
      });
    }

    // Get updated like count
    const likeCount = await Like.countDocuments({ post: id });

    // Get post with populated author
    const updatedPost = await Post.findById(id).populate("author", "displayName email");

    res.json({
      message: `Post ${action}d successfully`,
      post: {
        ...updatedPost.toObject(),
        likeCount,
      },
    });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({
      error: "Failed to update post likes",
      details: err.message,
    });
  }
};

/**
 * DELETE: Delete all posts (Admin operation)
 * DELETE /api/posts
 * WARNING: This is destructive!
 */
export const deleteAllPosts = async (req, res) => {
  try {
    // Get all post IDs
    const posts = await Post.find({}, "_id");
    const postIds = posts.map((p) => p._id);

    // Delete all likes for all posts
    await Like.deleteMany({ post: { $in: postIds } });

    // Delete all posts
    const result = await Post.deleteMany({});

    res.json({
      message: "All posts deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Delete all posts error:", err);
    res.status(500).json({
      error: "Failed to delete all posts",
      details: err.message,
    });
  }
};
