# 🔄 API Flow Diagrams

## 1. REQUEST FLOW - How Requests Are Processed

```
Client (Postman)
    |
    | POST http://localhost:5000/api/posts
    | Headers: Authorization: Bearer <TOKEN>
    | Body: { title, message, creator, tags }
    |
    V
[index.js] - Main Server File
    |
    | ✅ CORS Middleware (allow cross-origin)
    | ✅ JSON Parser (parse request body)
    | ✅ Request Logger (log incoming request)
    |
    V
[Router] - Route Matching
    | 
    | Matches: POST /api/posts
    | Maps to: server/routes/posts.js
    |
    V
[posts.js] - Posts Router
    |
    | ✅ Auth Middleware (verify JWT token)
    |    └─ Extracts: req.user = { id, username, email }
    |
    | ✅ Route Handler: createPost function
    |
    V
[postController.js] - Business Logic
    |
    | ✅ Validate input (title, message, creator)
    | ✅ Check for errors
    | ✅ Create Post document in MongoDB
    | ✅ Return response
    |
    V
[Database] - MongoDB
    |
    | Stores document in 'posts' collection
    |
    V
Response sent back to Client
    |
    | Status: 201 Created
    | Body: { message, post: { _id, title, ... } }
```

---

## 2. AUTHENTICATION FLOW

```
USER REGISTRATION
═════════════════

Client
  └─ POST /api/auth/register
     { username, email, password }
           |
           V
   [userController.js]
      |
      ├─ ✅ Validate fields
      ├─ ✅ Check if email exists
      ├─ ✅ Hash password (bcryptjs)
      ├─ ✅ Save to Database
      ├─ ✅ Generate JWT token
      |     └─ Token payload: { id, username, email }
      |     └─ Expires in: 7 days
      └─ Return: { user, token }


USER LOGIN
══════════

Client
  └─ POST /api/auth/login
     { email, password }
           |
           V
   [userController.js]
      |
      ├─ ✅ Find user by email
      ├─ ✅ Compare password hash
      ├─ ✅ If match: Generate JWT token
      └─ Return: { user, token }


PROTECTED REQUEST
═════════════════

Client
  └─ POST /api/posts
     Headers: Authorization: Bearer <TOKEN>
     Body: { title, message, creator }
           |
           V
   [middleware/auth.js]
      |
      ├─ ✅ Extract token from header
      ├─ ✅ Verify token signature
      ├─ ✅ Decode payload: { id, username, email }
      ├─ ✅ Attach to request: req.user = payload
      └─ Allow request to proceed
           |
           V
   [postController.js]
      |
      └─ Access req.user.email in creator field
           |
           V
      Store post in database
```

---

## 3. ERROR HANDLING FLOW

```
REQUEST
   |
   V
[Middleware Processing]
   |
   ├─ Syntax Error?
   |  └─ Return: 400 Bad Request
   |
   ├─ No Authorization Header?
   |  └─ Return: 401 Unauthorized
   |
   ├─ Invalid Token?
   |  └─ Return: 401 Invalid token
   |
   ├─ Token Expired?
   |  └─ Return: 401 Token Expired
   |
   └─ ✅ All OK? Proceed to controller
      |
      V
[Controller Processing]
      |
      ├─ Missing Fields?
      |  └─ Return: 400 Missing required fields
      |
      ├─ Validation Failed?
      |  └─ Return: 400 Validation error details
      |
      ├─ Database Error?
      |  └─ Return: 500 Internal Server Error
      |
      └─ ✅ All OK? Return Success
         └─ Return: 200/201 with data
```

---

## 4. DATABASE SCHEMA

```
USERS Collection
════════════════

┌─────────────────────────────────┐
│         User Document           │
├─────────────────────────────────┤
│ _id: ObjectId                   │
│ username: "walt_whitman"        │
│ email: "walt@example.com"       │
│ password: "$2a$10$hash..."      │
│ createdAt: 2025-11-26T...       │
│ updatedAt: 2025-11-26T...       │
└─────────────────────────────────┘


POSTS Collection
════════════════

┌─────────────────────────────────┐
│         Post Document           │
├─────────────────────────────────┤
│ _id: ObjectId                   │
│ title: "O Captain!"             │
│ message: "O Captain! my..."     │
│ creator: "Walt Whitman"         │
│ tags: ["poetry", "classic"]     │
│ likeCount: 5                    │
│ createdAt: 2025-11-26T...       │
│ updatedAt: 2025-11-26T...       │
└─────────────────────────────────┘
```

---

## 5. API ENDPOINT TREE

```
http://localhost:5000/
│
├── / (GET)
│  └─ Root endpoint
│
├── /health (GET)
│  └─ Server health check
│
├── /api/
│  │
│  ├── /auth
│  │  ├── POST /register     (public)
│  │  ├── POST /login        (public)
│  │  ├── GET /profile       (protected)
│  │  ├── PATCH /profile     (protected)
│  │  ├── PATCH /change-password (protected)
│  │  ├── DELETE /profile    (protected)
│  │  └── GET /verify        (protected)
│  │
│  └── /posts
│     ├── POST /             (protected)
│     ├── GET /              (public)
│     ├── GET /:id           (public)
│     ├── PATCH /:id         (protected)
│     ├── PATCH /:id/like    (protected)
│     ├── DELETE /:id        (protected)
│     └── DELETE /           (protected)
│
└── (404 handler for unmatched routes)
```

---

## 6. REQUEST/RESPONSE CYCLE EXAMPLE

```
┌─────────────────────────────────────────────────────┐
│ REQUEST: Create a Post                              │
├─────────────────────────────────────────────────────┤
│ POST http://localhost:5000/api/posts                │
│                                                      │
│ Headers:                                            │
│ {                                                   │
│   "Content-Type": "application/json",               │
│   "Authorization": "Bearer eyJhbGc..."              │
│ }                                                   │
│                                                      │
│ Body:                                               │
│ {                                                   │
│   "title": "My Poem",                               │
│   "message": "This is a beautiful poem...",         │
│   "creator": "John Keats",                          │
│   "tags": ["poetry", "nature"]                      │
│ }                                                   │
└─────────────────────────────────────────────────────┘
         │
         V
┌─────────────────────────────────────────────────────┐
│ SERVER PROCESSING                                   │
├─────────────────────────────────────────────────────┤
│ 1. ✅ Parse JSON body                               │
│ 2. ✅ Log request: POST /api/posts                  │
│ 3. ✅ Verify auth token                             │
│ 4. ✅ Validate input (title, message, creator)      │
│ 5. ✅ Check MongoDB connection                      │
│ 6. ✅ Create document in database                   │
│ 7. ✅ Generate response                             │
└─────────────────────────────────────────────────────┘
         │
         V
┌─────────────────────────────────────────────────────┐
│ RESPONSE: Post Created                              │
├─────────────────────────────────────────────────────┤
│ Status: 201 Created                                 │
│                                                      │
│ Headers:                                            │
│ {                                                   │
│   "Content-Type": "application/json"                │
│ }                                                   │
│                                                      │
│ Body:                                               │
│ {                                                   │
│   "message": "Post created successfully",           │
│   "post": {                                         │
│     "_id": "67437a1b9c8d2e1f4a5b6c7d",              │
│     "title": "My Poem",                             │
│     "message": "This is a beautiful poem...",       │
│     "creator": "John Keats",                        │
│     "tags": ["poetry", "nature"],                   │
│     "likeCount": 0,                                 │
│     "createdAt": "2025-11-26T19:57:30.123Z",        │
│     "updatedAt": "2025-11-26T19:57:30.123Z"         │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## 7. SERVER STARTUP SEQUENCE

```
npm run dev
    |
    V
node index.js
    |
    V
[dotenv.config()]
    └─ Load .env file
    └─ Set environment variables
    |
    V
[Express App Setup]
    ├─ app.use(cors())
    ├─ app.use(express.json())
    ├─ app.use(urlencoded())
    └─ Setup middleware
    |
    V
[Mount Routes]
    ├─ app.use("/api/auth", authRoutes)
    ├─ app.use("/api/posts", postsRoutes)
    └─ Routes ready to handle requests
    |
    V
[MongoDB Connection]
    |
    ├─ Try to connect to MONGO_URI
    |  |
    |  ├─ ✅ Success
    |  |  └─ Console: "✅ MongoDB connected"
    |  |  └─ Start server on PORT
    |  |
    |  └─ ❌ Failed
    |     └─ Console: "❌ MongoDB connection error"
    |     └─ Exit process
    |
    V
[Server Running]
    |
    ├─ Listening on port 5000
    ├─ Ready to accept requests
    ├─ Waiting for client connections
    |
    V
[Request Arrives]
    |
    └─ Process according to flow diagrams above
```

---

## 8. Token Lifecycle

```
REGISTER/LOGIN
    |
    V
JWT Token Generated
    │
    ├─ Header:   { "alg": "HS256", "typ": "JWT" }
    ├─ Payload:  { id, username, email, exp: 7days }
    └─ Signature: HMACSHA256(header.payload, JWT_SECRET)
    |
    V
Token Sent to Client
    │
    └─ Stored in Postman / LocalStorage / Cookie
    |
    V
Client Sends with Each Protected Request
    │
    └─ Authorization: Bearer <TOKEN>
    |
    V
Server Receives Request
    │
    ├─ Extract token from header
    ├─ Verify signature with JWT_SECRET
    ├─ Check expiration time
    ├─ Decode payload
    └─ Attach user info to req.user
    |
    V
Controller Accesses User Info
    │
    ├─ req.user.id
    ├─ req.user.username
    └─ req.user.email
    |
    V
After 7 Days
    │
    └─ Token Expires
       └─ Subsequent requests get 401
       └─ User must login again to get new token
```

---

These diagrams show exactly how your API processes requests, handles authentication, manages data, and flows through the entire system!
