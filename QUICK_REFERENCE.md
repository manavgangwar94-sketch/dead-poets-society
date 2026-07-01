# 🚀 Quick Reference - Security Testing

## Start Server
```bash
cd server
node index.js
```

## Test Password Validation (Should fail)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"test@example.com","password":"weak"}'
```
**Result:** 400 - Validation failed (password too weak)

---

## Register New User (Should succeed)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"SecurePass123!"}'
```
**Result:** 201 - User registered with token
**Save the token for next tests**

---

## Login User (Should succeed)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```
**Result:** 200 - Login successful with new token

---

## Wrong Password (Run 5 times for lockout)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"WrongPassword123!"}'
```
**Results:**
- Attempts 1-4: 401 Unauthorized
- Attempt 5: 423 Account locked for 2 hours

---

## Access Protected Route WITH Token
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Result:** 200 - Profile data returned

---

## Access Protected Route WITHOUT Token
```bash
curl http://localhost:5000/api/auth/profile
```
**Result:** 401 Unauthorized

---

## Change Password
```bash
curl -X PATCH http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"currentPassword":"SecurePass123!","newPassword":"NewSecurePass456@"}'
```
**Result:** 200 - Password changed

---

## Check Logs
```bash
# All security events
tail server/logs/security.log

# Real-time monitoring
tail -f server/logs/security.log

# All errors
cat server/logs/error.log
```

---

## Password Requirements
✅ Minimum 8 characters
✅ Uppercase letter (A-Z)
✅ Lowercase letter (a-z)
✅ Number (0-9)
✅ Special character (@$!%*?&)

**Example:** `SecurePass123!`

---

## Key Features You Can Demonstrate

### 1. Input Validation
- Weak passwords rejected
- Invalid emails rejected
- Username format validated

### 2. Account Lockout
- 5 failed attempts = locked for 2 hours
- Automatic unlock after 2 hours
- Counter resets on successful login

### 3. Rate Limiting
- Login: 5 attempts per 15 minutes
- Registration: 5 per hour
- General: 100 per 15 minutes

### 4. Security Logging
- All login attempts logged
- Failed attempts recorded
- Account lockouts logged
- Logs in `server/logs/security.log`

### 5. Protected Routes
- `/api/auth/profile` - requires token
- `/api/auth/change-password` - requires token
- `/api/auth/verify` - requires token

---

## Password Change Validation
```bash
# Wrong current password (will fail)
curl -X PATCH http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"currentPassword":"Wrong123!","newPassword":"NewPass456@"}'
```
**Result:** 401 - Current password incorrect

---

## Rate Limit Testing
```bash
# Run this 6 times rapidly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"john@example.com","password":"wrong"}'
done
```
**Result:** First 5 get 401, 6th gets 429 (rate limited)

---

## Error Handling
```bash
# Non-existent route (404)
curl http://localhost:5000/api/nonexistent
```
**Result:** 404 - Route not found

---

## Environment Setup
Copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
```

Update `.env` with your values:
```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

---

## Things to Mention in Interviews

1. **"I implemented bcrypt password hashing with 12 rounds for security"**
2. **"Account lockout after 5 failed attempts prevents brute force attacks"**
3. **"Rate limiting on all endpoints prevents DDoS attacks"**
4. **"Comprehensive logging for security audits and debugging"**
5. **"Input validation on server-side prevents NoSQL injection"**
6. **"Helmet.js provides security headers against common attacks"**
7. **"Structured error handling that doesn't expose sensitive info"**

