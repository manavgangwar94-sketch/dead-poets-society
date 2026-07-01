# Schema Migration Summary

## 🎯 What Was Changed

### Backend (Server) Changes

#### 1️⃣ Models Updated

**User.js**
- ✅ Renamed `username` → `displayName`
- ✅ `displayName` is **not unique** (allows same display names)
- ✅ `email` remains **unique**
- ✅ All JWT tokens now encode `displayName` instead of `username`

**Post.js**  
- ✅ Replaced `creator` (string) → `author` (ObjectId reference to User)
- ✅ Removed `likeCount` field entirely
- ✅ Added proper database relationship between posts and users

**Like.js (NEW)**
- ✅ New collection to store user likes
- ✅ Fields: `user` (ObjectId), `post` (ObjectId), `createdAt`
- ✅ Unique index prevents duplicate likes from same user on same post
- ✅ Likes now **permanent** and **user-specific**

#### 2️⃣ Controllers Updated

**userController.js**
- ✅ Register: Uses `displayName` instead of `username`
- ✅ Login: Returns `displayName` in JWT token
- ✅ Profile operations: Works with `displayName`
- ✅ No longer checks username uniqueness (allows duplicates)

**postController.js (Completely Rewritten)**
- ✅ `createPost`: Stores `author` as user ObjectId
- ✅ `getPosts`: Populates author info and counts likes from Like collection
- ✅ `getPostById`: Returns computed `likeCount` from database
- ✅ `updatePost`: Added ownership check (only author can edit)
- ✅ `deletePost`: Added ownership check + deletes related likes
- ✅ `likePost`: NEW implementation with Like model
  - Prevents duplicate likes (one per user per post)
  - Stores permanent record in database
  - Works even after page refresh or logout/login

**auth.js (Middleware)**
- ✅ Updated console logging to show `displayName`
- ✅ Comments updated in code

**validators.js**
- ✅ `validateRegister`: Changed validation for `displayName` (2-50 chars, no character restrictions)
- ✅ `validateUpdateProfile`: Same change for `displayName`

---

### Frontend (Client) Changes

#### 1️⃣ Files Updated

**RegisterPage.jsx**
- ✅ Form state changed from `username` to `displayName`
- ✅ Input label changed
- ✅ Saves `displayName` to localStorage
- ✅ Form validation accepts non-username text

**LoginPage.jsx**
- ✅ Calls `setAuthToken` with `displayName` instead of `username`

**auth.js**
- ✅ Reads/writes `displayName` from localStorage
- ✅ `setAuthToken()` function signature changed
- ✅ `clearAuth()` removes `displayName` on logout

**HomePage.jsx**
- ✅ Displays author as `p.author?.displayName` (from populated author object)
- ✅ Like functionality changed: uses database, not localStorage persistence

**PostDetail.jsx**
- ✅ Displays author as `post.author?.displayName`
- ✅ Ownership check: compares `post.author?._id` with `currentUserId`
- ✅ Stores current user's `userId` in localStorage for comparison

---

## 📊 Data Structure Changes

### Before
```javascript
// User
{ username: "john_poet", email: "john@example.com", ... }

// Post
{ title: "My Poem", message: "...", creator: "john_poet", likeCount: 5, ... }

// Likes (Client-side only)
// Stored in localStorage as: { "likedPosts": ["postId1", "postId2"] }
// Lost on logout!
```

### After
```javascript
// User
{ displayName: "john_poet", email: "john@example.com", ... }

// Post
{ title: "My Poem", message: "...", author: ObjectId("60d5ec..."), ... }
// likeCount is NOT stored, computed from Like collection

// Like (Database)
{ user: ObjectId("..."), post: ObjectId("..."), createdAt: Date }
// One document per user-post pair
```

---

## 🚀 Deployment Sequence

### Step 1: Code Deployment
1. ✅ Push code changes to GitHub
2. ✅ Render auto-deploys backend
3. ✅ Render auto-deploys frontend

### Step 2: Database Migration  
1. ⏳ **Run migration script** (see migration.js)
   ```bash
   MONGODB_URI="your_connection_string" node migration.js
   ```
2. ⏳ Script will:
   - Add `displayName` to all users (from old `username` field)
   - Convert posts to use `author` ObjectId references
   - Initialize Like collection

### Step 3: User Actions
1. ⏳ Users clear browser cache
2. ⏳ Users login again
3. ⏳ Existing likes will be lost (were localStorage-based)
4. ⏳ New likes work permanently

---

## ✅ Testing Checklist

After deployment, verify each feature:

- [ ] **Register**: Can create user with any display name
- [ ] **Duplicate Names**: Two users can have same display name
- [ ] **Login**: Correct displayName is shown after login
- [ ] **Create Post**: Author name matches logged-in user
- [ ] **Like Post**: Shows +1, persists after refresh
- [ ] **Multiple Users Like**: Same post shows multiple likes
- [ ] **Unlike Post**: Shows -1, reflects immediately
- [ ] **Edit Post**: Only author can edit
- [ ] **Delete Post**: Only author can delete, likes deleted too
- [ ] **Logout/Login**: Likes still persist

---

## 🔄 Comparison: Old vs New Like System

| Feature | Old | New |
|---------|-----|-----|
| **Storage** | Browser localStorage | MongoDB database |
| **Persistence** | Lost on logout | Permanent |
| **Per User** | No, global | Yes, per user account |
| **Duplicate Likes** | Possible | Prevented by unique index |
| **After Refresh** | Lost | Persists |
| **Multi-Device** | Different on each device | Same across all devices |
| **Visibility** | Only to current user | Visible to all users |

---

## 📋 Files Modified

### Backend Files
- ✅ `server/models/User.js` - username → displayName
- ✅ `server/models/Post.js` - creator → author (ref)
- ✅ `server/models/Like.js` - **NEW**
- ✅ `server/controllers/userController.js` - displayName throughout
- ✅ `server/controllers/postController.js` - complete rewrite
- ✅ `server/middleware/auth.js` - minor logging updates
- ✅ `server/middleware/validators.js` - displayName validation

### Frontend Files
- ✅ `client/src/auth.js` - localStorage keys
- ✅ `client/src/pages/RegisterPage.jsx` - displayName form
- ✅ `client/src/pages/LoginPage.jsx` - displayName passing
- ✅ `client/src/pages/HomePage.jsx` - author display
- ✅ `client/src/pages/PostDetail.jsx` - author display, ownership check

### New Files
- ✅ `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- ✅ `migration.js` - Database migration script

---

## 🎯 Key Benefits

1. **Better Data Integrity**: Posts linked to users via ObjectId (not prone to typos)
2. **Proper Like Tracking**: Permanent, per-user, prevents duplicates
3. **User Flexibility**: Display names can be duplicate (less restrictive)
4. **Scalability**: Proper foreign keys make future features easier
5. **Reliability**: Likes survive through sessions, devices, restarts

---

## ⚠️ Breaking Changes for Users

After migration, users will notice:

1. **Login Required**: Old sessions invalidated (token schema changed)
2. **Likes Reset**: localStorage-based likes are cleared
3. **Display Names**: Username field is now "display name" (more flexible)

---

## 🆘 Troubleshooting Commands

### Check if Like model works
```bash
curl -X PATCH http://localhost:5000/api/posts/{postId}/like \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action":"like"}'
```

### Check post with populated author
```bash
curl http://localhost:5000/api/posts/{postId}
# Response should have: { post: { ..., author: { _id, displayName, email }, likeCount: 5 } }
```

### Reset likes (careful!)
```bash
mongo mongodb://... --eval "db.likes.deleteMany({})"
```

---

## ✨ Future Enhancements Enabled

With the new schema, you can now easily add:

1. **Like Attribution**: Show "Liked by john_poet, jane_poet, and 3 others"
2. **Comments**: Store comments linked to posts
3. **Followers**: Track which users follow which authors
4. **Activity Feed**: "john_poet liked jane_poet's poem"
5. **User Profiles**: Show all posts and likes by a user
6. **Notifications**: Notify authors when someone likes their post
