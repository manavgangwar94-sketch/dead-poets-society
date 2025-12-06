/**
 * Frontend Integration Test Script
 * This simulates what the frontend should be doing
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.js";
import jwt from "jsonwebtoken";

async function testFullFlow() {
  try {
    console.log("🎯 FULL INTEGRATION TEST\n");
    console.log("Simulating: Register → Login → Create Post Flow\n");

    // 1. Connect to MongoDB
    console.log("1️⃣  CONNECTING TO DATABASE");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("   ✅ Connected\n");

    // 2. Simulate Registration (backend creates user and token)
    console.log("2️⃣  SIMULATING REGISTRATION");
    const testUser = {
      username: "poetrywriter",
      email: "poetrywriter@example.com",
      password: "secure123"
    };
    
    let user = await User.findOne({ email: testUser.email });
    if (!user) {
      user = await User.create(testUser);
      console.log("   ✅ User created:", user.username);
    } else {
      console.log("   ℹ️  User already exists:", user.username);
    }

    // 3. Simulate Token Generation (what backend returns after login)
    console.log("\n3️⃣  SIMULATING LOGIN (GENERATING TOKEN)");
    const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("   ✅ Token generated");
    console.log("   📋 Token preview:", token.substring(0, 50) + "...");
    
    // 4. Simulate Frontend Storing Token
    console.log("\n4️⃣  SIMULATING FRONTEND localStorage.setItem('token', ...)");
    const simulatedLocalStorage = {
      token: token,
      username: user.username
    };
    console.log("   ✅ Token stored in localStorage");
    console.log("   📋 localStorage.token:", simulatedLocalStorage.token.substring(0, 50) + "...");
    console.log("   📋 localStorage.username:", simulatedLocalStorage.username);

    // 5. Simulate Frontend Creating Post
    console.log("\n5️⃣  SIMULATING FRONTEND POST REQUEST");
    const postPayload = {
      title: "Integration Test Poem",
      message: "This poem was created through a complete integration test.\nThe token flowed perfectly from login to post creation.",
      tags: ["test", "integration", "success"],
    };
    
    console.log("   📦 Payload ready:", JSON.stringify(postPayload, null, 2).substring(0, 100) + "...");

    // 6. Send to Backend with Token
    console.log("\n6️⃣  SENDING POST REQUEST TO BACKEND");
    console.log("   📡 POST http://localhost:5000/api/posts");
    console.log("   🔑 Authorization: Bearer", simulatedLocalStorage.token.substring(0, 30) + "...");
    
    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${simulatedLocalStorage.token}`,
      },
      body: JSON.stringify(postPayload),
    });

    const result = await response.json();

    // 7. Check Result
    console.log("\n7️⃣  RESPONSE RECEIVED");
    console.log("   Status:", response.status, response.ok ? "✅" : "❌");
    
    if (response.ok) {
      console.log("   ✅ POST SUCCESSFUL!");
      console.log("   📄 Post ID:", result.post._id);
      console.log("   📝 Title:", result.post.title);
      console.log("   👤 Creator:", result.post.creator);
      console.log("   🏷️  Tags:", result.post.tags.join(", "));
    } else {
      console.log("   ❌ POST FAILED!");
      console.log("   Error:", result.error);
      console.log("   Message:", result.message);
    }

    // 8. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log("✅ User exists in database");
    console.log("✅ JWT token generated successfully");
    console.log("✅ Token can be stored in localStorage");
    console.log(response.ok ? "✅ POST request succeeded with token" : "❌ POST request failed");
    console.log("\n💡 CONCLUSION:");
    if (response.ok) {
      console.log("   The entire flow works! The issue is in the frontend implementation.");
      console.log("   Check that frontend is:");
      console.log("   1. Actually calling the API with the token");
      console.log("   2. Token is being retrieved from localStorage");
      console.log("   3. Token is being passed to createPost()");
    }

    process.exit(response.ok ? 0 : 1);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}

testFullFlow();
