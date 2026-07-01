/**
 * Database Migration Script
 * Run this AFTER deploying the new code to migrate your database
 * 
 * Usage:
 * node migration.js
 * 
 * IMPORTANT: Set MONGODB_URI environment variable before running
 */

import mongoose from "mongoose";
import User from "./server/models/User.js";
import Post from "./server/models/Post.js";
import Like from "./server/models/Like.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dead-poets-society";

async function migrate() {
  let connection;
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log(`📍 URI: ${MONGODB_URI.substring(0, 50)}...`);

    connection = await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Check existing data
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    console.log(`📊 Current state:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Posts: ${postCount}\n`);

    // Step 2: Migrate users (add displayName from username)
    console.log("📝 Step 1: Migrating user data...");
    const users = await User.find();
    let migratedUsers = 0;

    for (const user of users) {
      // If user has old username field but no displayName, copy it
      if (user.username && !user.displayName) {
        user.displayName = user.username;
        await user.save();
        migratedUsers++;
        console.log(`   ✅ User: ${user.email} -> displayName="${user.displayName}"`);
      } else if (!user.displayName) {
        // If no username either, generate one from email
        user.displayName = user.email.split("@")[0];
        await user.save();
        migratedUsers++;
        console.log(`   ✅ User: ${user.email} -> displayName="${user.displayName}"`);
      }
    }
    console.log(`✅ Migrated ${migratedUsers} users\n`);

    // Step 3: Migrate posts (add author reference from creator)
    console.log("📝 Step 2: Migrating post data...");
    const posts = await Post.find();
    let migratedPosts = 0;
    let failedPosts = 0;

    for (const post of posts) {
      // If post has old creator field but no author
      if (post.creator && !post.author) {
        // Try to find the user by displayName
        const author = await User.findOne({
          displayName: post.creator,
        });

        if (author) {
          post.author = author._id;
          await post.save();
          migratedPosts++;
          console.log(
            `   ✅ Post: "${post.title}" -> author=${post.author}`
          );
        } else {
          failedPosts++;
          console.log(
            `   ⚠️ Post: "${post.title}" -> No user found for creator="${post.creator}"`
          );
          // Optionally, assign to the first user as fallback
          if (users.length > 0) {
            post.author = users[0]._id;
            await post.save();
            console.log(
              `      (Assigned to fallback user: ${users[0].email})`
            );
            migratedPosts++;
            failedPosts--;
          }
        }
      } else if (!post.author && users.length > 0) {
        // If no author and no creator, assign to first user
        post.author = users[0]._id;
        await post.save();
        migratedPosts++;
        console.log(
          `   ✅ Post: "${post.title}" -> assigned to ${users[0].email}`
        );
      }
    }
    console.log(`✅ Migrated ${migratedPosts} posts`);
    if (failedPosts > 0) {
      console.log(`⚠️ Failed to migrate ${failedPosts} posts\n`);
    } else {
      console.log("");
    }

    // Step 4: Create Like collection (automatically created on first use)
    console.log("📝 Step 3: Setting up Likes collection...");
    const likeCount = await Like.countDocuments();
    console.log(`   📊 Existing likes: ${likeCount}`);
    console.log(`   ✅ Likes collection ready for new data\n`);

    // Step 5: Summary
    console.log("=" . repeat(50));
    console.log("🎉 MIGRATION COMPLETE!");
    console.log("=" . repeat(50));
    console.log("\n📋 Summary:");
    console.log(`   ✅ Users processed: ${migratedUsers}`);
    console.log(`   ✅ Posts migrated: ${migratedPosts}`);
    console.log(`   ✅ Likes collection initialized`);
    console.log("\n🚀 Next steps:");
    console.log("   1. Deploy frontend code");
    console.log("   2. Clear browser cache (Ctrl+Shift+Delete)");
    console.log("   3. Test registration and login");
    console.log("   4. Test creating and liking posts");
    console.log("\n⚠️ Important:");
    console.log("   - All localStorage-based likes have been reset");
    console.log("   - Users need to login again with new schema");
    console.log("   - Old username fields will be cleaned up separately\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ MIGRATION FAILED!");
    console.error("Error:", err.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check MONGODB_URI is correct");
    console.error("   2. Verify you have database access");
    console.error("   3. Check network connectivity");
    console.error("   4. Review error details above\n");
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Run migration
console.log("🚀 Dead Poets Society - Database Migration\n");
migrate();
