import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import Post from "./models/Post.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

async function testCreatePost() {
  try {
    console.log("🚀 Starting backend post creation test...\n");

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    console.log("📍 Connecting to MongoDB...");
    console.log("   URI:", MONGO_URI.substring(0, 30) + "...");
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Find or create a test user
    console.log("👤 Looking for test user...");
    let user = await User.findOne({ email: "test@example.com" });
    
    if (!user) {
      console.log("   Creating new test user...");
      user = await User.create({
        username: "testpoet",
        email: "test@example.com",
        password: "hashedpassword123", // In production, this should be hashed
      });
      console.log("✅ Test user created:", user.username);
    } else {
      console.log("✅ Test user found:", user.username);
    }

    // Create a test post
    console.log("\n📝 Creating test post...");
    const testPost = await Post.create({
      title: "Digital Dawn",
      message: "The server hums a quiet tune,\nBeneath the pale and cyber moon.\nData flows in streams of light,\nAwake within the endless night.",
      creator: user.username,
      tags: ["technology", "poetry", "night"],
    });

    console.log("✅ Post created successfully!\n");
    console.log("📄 Post Details:");
    console.log("   ID:", testPost._id);
    console.log("   Title:", testPost.title);
    console.log("   Creator:", testPost.creator);
    console.log("   Message:", testPost.message.substring(0, 50) + "...");
    console.log("   Tags:", testPost.tags);
    console.log("   Created:", testPost.createdAt);
    console.log("   Likes:", testPost.likeCount);

    // Generate a JWT token for this user
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("\n🔐 Generated JWT Token:");
    console.log("   Token:", token.substring(0, 30) + "...");

    console.log("\n✅ Test completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Go to http://localhost:3001");
    console.log("   2. Go to Home page");
    console.log("   3. You should see the post titled 'Digital Dawn'");
    console.log("   4. You can now test update/delete/like operations");

    // Verify post is in database
    console.log("\n🔍 Verifying post in database...");
    const allPosts = await Post.find();
    console.log("   Total posts in database:", allPosts.length);
    console.log("   Latest posts:");
    allPosts.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. "${p.title}" by ${p.creator}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err);
    process.exit(1);
  }
}

testCreatePost();
