# Updated Database Design & Data Flow

## 📊 New ER Diagram

```
┌─────────────────────────┐
│        USER             │
├─────────────────────────┤
│ _id (ObjectId)          │
│ displayName (String)    │  ← NOW: Non-unique, flexible names
│ email (String, unique)  │
│ password (String)       │
│ loginAttempts (Number)  │
│ lockUntil (Date)        │
│ lastLogin (Date)        │
│ isActive (Boolean)      │
│ role (String)           │
│ createdAt (Date)        │
│ updatedAt (Date)        │
└──────┬──────────────────┘
       │
       │ 1 to Many
       │ (author)
       │
       ▼
┌─────────────────────────┐
│        POST             │
├─────────────────────────┤
│ _id (ObjectId)          │
│ title (String)          │
│ message (String)        │
│ author (ObjectId)       │  ← NOW: Proper ref to User._id
│ tags ([String])         │
│ createdAt (Date)        │
│ updatedAt (Date)        │
└────────┬────────────────┘
         │
         │ 1 to Many
         │ (post)
         │
         ▼
┌─────────────────────────┐
│        LIKE (NEW)       │
├─────────────────────────┤
│ _id (ObjectId)          │
│ user (ObjectId)         │  ← User who liked
│ post (ObjectId)         │  ← Post that was liked
│ createdAt (Date)        │
├─────────────────────────┤
│ UNIQUE: {user, post}    │  ← One like per user per post
└─────────────────────────┘
```

---

## 🔄 Data Flow: Creating & Liking a Post

### 1️⃣ User Registration

```
[Browser] POST /api/auth/register
├─ displayName: "Jane"
├─ email: "jane@example.com"
└─ password: "Secure123!"
            ↓
[Server] userController.registerUser()
├─ Check email not used ✓
├─ Hash password ✓
└─ Create User document
        ↓
[MongoDB] users collection
{
  _id: "507f1f77bcf86cd799439011",
  displayName: "Jane",
  email: "jane@example.com",
  password: "$2a$12$...",  ← hashed
  createdAt: 2024-07-01T...
}
        ↓
[Server] Generate JWT token
{
  id: "507f1f77bcf86cd799439011",
  displayName: "Jane",
  email: "jane@example.com"
}
        ↓
[Browser] localStorage
├─ token: "eyJh..."
├─ displayName: "Jane"
└─ likedPosts: []  ← we'll stop using this
```

---

### 2️⃣ Create a Post

```
[Browser] POST /api/posts
├─ Authorization: "Bearer eyJh..."
├─ title: "My Journey"
├─ message: "Today I learned about databases..."
└─ tags: ["learning", "tech"]
            ↓
[Middleware] auth()
├─ Extract & verify JWT token
└─ Set req.user = { id: "507f1f...", displayName: "Jane", ... }
            ↓
[Server] postController.createPost()
├─ Get author ID from req.user.id = "507f1f..."
├─ Validate fields
└─ Create Post document
        ↓
[MongoDB] posts collection
{
  _id: "507f1f77bcf86cd799439012",
  title: "My Journey",
  message: "Today I learned about databases...",
  author: "507f1f77bcf86cd799439011",  ← Reference to User._id
  tags: ["learning", "tech"],
  createdAt: 2024-07-01T...
}
        ↓
[Server] Populate author info
├─ Find User with _id = "507f1f77bcf86cd799439011"
└─ Include displayName, email
        ↓
[Browser] Response shows:
{
  _id: "507f1f77bcf86cd799439012",
  title: "My Journey",
  author: {
    _id: "507f1f77bcf86cd799439011",
    displayName: "Jane",
    email: "jane@example.com"
  },
  tags: ["learning", "tech"],
  likeCount: 0  ← computed, not stored!
}
```

---

### 3️⃣ Like a Post

```
[Browser] PATCH /api/posts/{postId}/like
├─ Authorization: "Bearer eyJh..."
├─ action: "like"
            ↓
[Middleware] auth()
└─ req.user = { id: "507f1f...", displayName: "Jane", ... }
            ↓
[Server] postController.likePost()
├─ Verify post exists ✓
├─ Check if Like already exists
│   ├─ Query: { user: "507f1f...", post: "507f1f77bcf..." }
│   └─ Result: not found ✓
└─ Action = "like" → Create new Like
        ↓
[MongoDB] likes collection
{
  _id: "507f1f77bcf86cd799439013",
  user: "507f1f77bcf86cd799439011",   ← Jane's user ID
  post: "507f1f77bcf86cd799439012",   ← The post she liked
  createdAt: 2024-07-01T...
}
        ↓
[Server] Count likes for this post
├─ Query: Like.countDocuments({ post: "507f1f77bcf..." })
└─ Result: likeCount = 1
        ↓
[Browser] Response:
{
  post: { ..., likeCount: 1 },
  message: "Post liked successfully"
}
        ↓
[Browser] Update UI
├─ Like count shows: ♥ 1
└─ Heart icon filled (liked state)
```

---

### 4️⃣ Refresh Page (Key Difference!)

#### ❌ OLD SYSTEM (localStorage only)
```
[Browser] Refresh page (F5)
    ↓
[Browser] Check localStorage
├─ likedPosts = []  ← Empty! List not saved
└─ Heart shows: ♡ 0  ← Looks unlike, but data intact on server
```

#### ✅ NEW SYSTEM (Database)
```
[Browser] Refresh page (F5)
    ↓
[Browser] GET /api/posts
├─ Authorization: Bearer ...
└─ Fetch all posts
            ↓
[Server] For each post
├─ Find author by _id
├─ Count likes: Like.countDocuments({ post: postId })
└─ Return { post, likeCount: 1 }
            ↓
[Browser] User sees:
├─ Author: "Jane" (not a string, actual user object)
├─ Like count: ♥ 1
└─ Like persisted! ✅
```

---

## 📈 Query Examples

### Get All Posts With Likes

```javascript
// Database Query
const posts = await Post.find()
  .populate("author", "displayName email")
  .sort({ createdAt: -1 });

// For each post, count likes
for (const post of posts) {
  const likeCount = await Like.countDocuments({ post: post._id });
  // ... return with likeCount
}

// Response
[
  {
    _id: "507f1f77bcf86cd799439012",
    title: "My Journey",
    message: "...",
    author: {
      _id: "507f1f77bcf86cd799439011",
      displayName: "Jane",
      email: "jane@example.com"
    },
    tags: ["learning"],
    likeCount: 3,      ← Computed from Like collection
    createdAt: "..."
  },
  // ... more posts
]
```

### Check If User Liked Post

```javascript
// Query
const liked = await Like.findOne({
  user: userId,
  post: postId
});

if (liked) {
  // User already liked
} else {
  // User hasn't liked yet
}
```

### Unlike a Post

```javascript
// Query
await Like.deleteOne({
  user: userId,
  post: postId
});

// Result: Like document removed
// Next query for likeCount will decrement automatically
const newCount = await Like.countDocuments({ post: postId });
// newCount = 2 (was 3 before unlike)
```

---

## 🎯 Key Relationships

### User → Post (One-to-Many)
```
One user can create many posts
├─ Jane creates "My Journey" (postId1)
├─ Jane creates "Learning Query" (postId2)
└─ ...

In database:
- User Jane: { _id: "jane123", displayName: "Jane" }
- Post 1: { author: "jane123", ... }
- Post 2: { author: "jane123", ... }
```

### User → Like (One-to-Many)
```
One user can like many posts
├─ Jane likes post1
├─ Jane likes post2
├─ Jane likes post3
└─ ...

In database:
- User Jane: { _id: "jane123" }
- Like 1: { user: "jane123", post: "post1" }
- Like 2: { user: "jane123", post: "post2" }
- Like 3: { user: "jane123", post: "post3" }

Constraint: Jane can only like each post ONCE
(enforced by unique index on {user, post})
```

### Post → Like (One-to-Many)
```
One post can be liked by many users
├─ Jane likes post1
├─ John likes post1
├─ Sarah likes post1
└─ ...

In database:
- Post 1: { _id: "post1", author: "jane123" }
- Like 1: { user: "jane123", post: "post1" }
- Like 2: { user: "john123", post: "post1" }
- Like 3: { user: "sarah123", post: "post1" }
```

---

## 📊 Before & After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Author Storage** | Post.creator = "Jane" (string) | Post.author = ObjectId (reference) |
| **Like Storage** | localStorage (client-side) | Like collection (database) |
| **Like Persistence** | Lost on logout/refresh | Permanent |
| **Like Scope** | Global (not per-user) | Per-user (one per user per post) |
| **Display Names** | Must be unique | Can duplicate |
| **Email Uniqueness** | Enforced | Still enforced |
| **Data Integrity** | Low (string-based) | High (ObjectId-based) |
| **Query Performance** | Slower (no indexes) | Faster (indexed lookups) |
| **Future Features** | Hard to implement | Easy (followers, notifications, etc.) |

---

## 🔒 Unique Constraints

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Likes
db.likes.createIndex({ user: 1, post: 1 }, { unique: true })
// This means: Only ONE document where user=X AND post=Y
// Prevents duplicate likes from same user on same post
```

---

## 💾 Storage Impact

### Comparison

| Collection | Before | After | Change |
|-----------|--------|-------|--------|
| users | ~500 bytes/user | ~500 bytes/user | Same |
| posts | ~300 bytes/post | ~300 bytes/post | Same |
| likes | 0 (not in DB) | ~150 bytes/like | **New!** |

### Example with 100 users, 500 posts, 2000 likes:
- **Before**: ~350 KB total
- **After**: ~350 KB + 300 KB (likes) = ~650 KB total
- **Overhead**: ~300 KB for complete like history (reasonable!)

---

## 🚀 Why This Design is Better

1. ✅ **Data Integrity**: Posts can't reference deleted users (foreign key relationship)
2. ✅ **Like Persistence**: Survives logout, browser close, device changes
3. ✅ **User-Specific**: Each like belongs to a user, enabling future features
4. ✅ **Duplicate Prevention**: Unique index prevents same user liking same post twice
5. ✅ **Query Efficiency**: Can find "all posts liked by Jane" in one query
6. ✅ **Analytics**: Can count likes, show "Liked by N users", etc.
7. ✅ **Scalability**: Easy to add followers, notifications, activity feeds
