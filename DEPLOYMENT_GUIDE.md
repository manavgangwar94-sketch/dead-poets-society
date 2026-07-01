# Database Schema Migration & Deployment Guide

## ✅ What Changed

### 1) User Model
- **OLD**: `username` (unique, 3-30 chars)
- **NEW**: `displayName` (non-unique, 2-50 chars)
- **Effect**: Users can now have the same display name, but email must remain unique

### 2) Post Model
- **OLD**: `creator` (string) + `likeCount` (number)
- **NEW**: `author` (ObjectId reference to User) + NO likeCount field
- **Effect**: Posts now have a proper relationship to users

### 3) New Like Model
- **NEW**: `Like` collection with unique user-post pair
- **Fields**: `user` (ObjectId), `post` (ObjectId), `createdAt`
- **Index**: Unique index on `{user, post}` prevents duplicate likes
- **Effect**: Like/unlike functionality is now permanent and per-user

---

## 🚀 Deployment Steps (CRITICAL)

### Step 1: Backup Your Database
```bash
# If using MongoDB Atlas, use their backup feature
# If local, export your data:
mongoexport --uri="mongodb://..." --collection users --out users_backup.json
mongoexport --uri="mongodb://..." --collection posts --out posts_backup.json
```

### Step 2: Deploy Backend Code
1. Push changes to your Git repository
2. The app will auto-deploy from Render (if configured)
3. Verify build succeeds on Render dashboard

### Step 3: Run Database Migration Script
Create this file on the server or run locally:

```javascript
// migration.js
import mongoose from 'mongoose';
import User from './server/models/User.js';
import Post from './server/models/Post.js';
import Like from './server/models/Like.js';

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Starting migration...');

    // Step 1: Rename username to displayName
    const users = await User.find();
    for (const user of users) {
      if (user.username && !user.displayName) {
        user.displayName = user.username;
        await user.save();
        console.log(`✅ Migrated user: ${user.username}`);
      }
    }

    // Step 2: Convert posts to use author reference
    const posts = await Post.find();
    for (const post of posts) {
      if (post.creator && !post.author) {
        const user = await User.findOne({ 
          displayName: post.creator 
        });
        if (user) {
          post.author = user._id;
          await post.save();
          console.log(`✅ Migrated post: ${post.title}`);
        }
      }
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
```

Run it:
```bash
node migration.js
```

### Step 4: Clear Old Fields (Optional but recommended)
After migration succeeds, remove old fields:

```javascript
// cleanup.js
async function cleanup() {
  await User.updateMany({}, { $unset: { username: "" } });
  await Post.updateMany({}, { $unset: { creator: "", likeCount: "" } });
  console.log('✅ Old fields removed');
}
```

### Step 5: Deploy Frontend Code
1. Push client code changes to Git
2. Render will auto-deploy
3. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
4. Or clear localStorage manually in browser console:
   ```javascript
   localStorage.clear()
   ```

---

## 🔍 Verification Checklist

After deployment, verify everything works:

### Test Registration
- [ ] Go to `/register`
- [ ] Create new user with display name "John"
- [ ] Create another user with display name "John" (should work now)
- [ ] Check token is saved in localStorage as `displayName`

### Test Login
- [ ] Login with email/password
- [ ] Verify `displayName` is in localStorage (not `username`)
- [ ] Check auth token works

### Test Posts
- [ ] Create a new post
- [ ] Verify post shows author display name (not creator string)
- [ ] Verify post doesn't show likeCount field anymore

### Test Likes
- [ ] Like a post
- [ ] Page should show +1 like count
- [ ] Refresh page - like should persist (NOT stored in localStorage anymore)
- [ ] Login as different user
- [ ] Same post should show like from first user
- [ ] Second user can like the same post

### Test Edit/Delete
- [ ] Only the post owner can edit/delete
- [ ] Deletion removes all associated likes

---

## 🛠️ Troubleshooting

### Like count not showing?
- Check browser console for errors
- Verify Like.js model is imported in postController.js
- Run test like request in Postman:
  ```
  PATCH /api/posts/{postId}/like
  Body: { "action": "like" }
  ```

### Posts show `author: null`?
- Migration didn't run
- Run migration.js script manually
- Check MongoDB Atlas to see if author field is populated

### Old usernames still showing in posts?
- Posts still have `creator` field
- Must run cleanup or manually update

### "You can only update/delete your own posts" error?
- Check if `post.author` ObjectId matches `req.user.id`
- Verify userId is saved in localStorage after login

---

## 📝 What to Tell Users

After deployment, users will see:

✅ **New features:**
- Can use duplicate display names
- Likes now persist permanently (not in localStorage)
- Likes tied to specific user accounts
- Can see who liked their posts (future feature)

⚠️ **Important notes:**
- **All existing likes will be lost** (they were in localStorage, now in database)
- Existing posts will show "null" author until migration runs
- Users need to login again (old tokens reference old schema)

---

## 🚨 Rollback Plan (If Something Goes Wrong)

### Quick Rollback:
1. Revert the code changes: `git revert HEAD`
2. Deploy the old version
3. Clear database changes or restore from backup

### Restore from Backup:
```bash
mongorestore --uri="mongodb://..." --collection users users_backup.json
mongorestore --uri="mongodb://..." --collection posts posts_backup.json
```

---

## 📊 Schema Summary

### Users Collection
```
{
  _id: ObjectId,
  displayName: String (not unique),
  email: String (unique),
  password: String (hashed),
  loginAttempts: Number,
  lockUntil: Date,
  lastLogin: Date,
  isActive: Boolean,
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```
{
  _id: ObjectId,
  title: String,
  message: String,
  author: ObjectId (ref: User),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Likes Collection (NEW)
```
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  post: ObjectId (ref: Post),
  createdAt: Date
}
```
**Unique Index**: `{ user: 1, post: 1 }`

---

## ✅ Final Checklist Before Going Live

- [ ] Backup database
- [ ] Backup code (git commit)
- [ ] Test locally first (if possible)
- [ ] Deploy backend to Render
- [ ] Run migration script
- [ ] Deploy frontend to Render
- [ ] Test all CRUD operations
- [ ] Test like/unlike functionality
- [ ] Clear browser cache and test again
- [ ] Monitor logs for errors
