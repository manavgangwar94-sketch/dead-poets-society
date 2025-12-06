import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

async function testPostWithToken() {
  try {
    console.log("🚀 Testing POST endpoint with JWT token...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Get the test user
    const user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      console.error("❌ Test user not found. Run test-post.js first.");
      process.exit(1);
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🔑 Generated token for:", user.username);
    console.log("   Full token:", token);
    console.log("   Token type:", typeof token);
    console.log("   Token length:", token.length);

    // Test the POST endpoint
    console.log("\n📡 Testing POST /api/posts endpoint...");
    const postData = {
      title: "Autumn Gold",
      message: "The leaves descend in golden rain,\nEach one a memory, each one a pain.\nBut in their fall, there's beauty born,\nA promise of the coming morn.",
      tags: ["autumn", "nature", "beauty"],
    };

    console.log("   Payload:", JSON.stringify(postData, null, 2));

    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    console.log("\n📊 Response received:");
    console.log("   Status:", response.status);
    console.log("   Status text:", response.statusText);

    const data = await response.json();
    console.log("   Body:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ POST successful!");
      console.log("   New post ID:", data.post._id);
      console.log("   New post title:", data.post.title);
    } else {
      console.log("\n❌ POST failed!");
      console.log("   Error:", data.error);
      console.log("   Message:", data.message);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

testPostWithToken();
