import Post from "../models/Post.js";

/**
 * CREATE: Add a new post to the database
 * POST /api/posts
 * Body: { title, message (or content), tags (optional) }
 * Protected: Requires authentication
 */
export const createPost = async (req, res) => {
  try {
    const { title, message, content, tags } = req.body;
    const creator = req.user?.username || req.user?.email || "Anonymous"; // Get from authenticated user

    // Validate required fields
    if (!title || (!message && !content)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["title", "message (or content)"],
      });
    }

    // Use message if provided, otherwise use content
    const postContent = message || content;

    // Create new post
    const newPost = await Post.create({
      title,
      message: postContent,
      creator,
      tags: tags || [],
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
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
      // If tags parameter provided, filter posts containing those tags
      filterQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    // Fetch posts with pagination and sorting
    const posts = await Post.find(filterQuery)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Post.countDocuments(filterQuery);

    res.json({
      message: "Posts retrieved successfully",
      posts,
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

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.json({
      message: "Post retrieved successfully",
      post,
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
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
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

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid post ID format",
      });
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

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
 * UPDATE: Like/Unlike a post (increment or decrement likeCount)
 * PATCH /api/posts/:id/like
 * Body: { action: "like" or "unlike" }
 */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

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

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Update like count
    if (action === "like") {
      post.likeCount += 1;
    } else {
      post.likeCount = Math.max(0, post.likeCount - 1); // Prevent negative likes
    }

    await post.save();

    res.json({
      message: `Post ${action}d successfully`,
      post,
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
