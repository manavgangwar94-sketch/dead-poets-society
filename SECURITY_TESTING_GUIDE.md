# 🧪 SECURITY TESTING GUIDE

Complete guide to test all security features implemented in Dead Poets Society API.

---

## 📋 Table of Contents

1. **Setup & Prerequisites**
2. **Testing Input Validation**
3. **Testing Authentication & Account Lockout**
4. **Testing Rate Limiting**
5. **Testing Password Security**
6. **Testing Authorization**
7. **Testing Error Handling**
8. **Automated Testing Commands**

---

## 🚀 Setup & Prerequisites

### 1. Start the Server

```bash
cd server
npm run dev
```

Server should start on `http://localhost:5000`

### 2. Verify Server is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-03-07T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### 3. Tools You'll Need

- **cURL** (command line) - for testing API endpoints
- **Postman** (GUI) - more user-friendly alternative
- **Visual Studio Code** - to monitor logs

---

## ✅ Testing Input Validation

### Test 1: Register with Weak Password

**What it tests:** Password strength validation

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "weak"
  }'
```

**Expected response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
    }
  ]
}
```

✅ **Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

**Example of STRONG password:** `SecurePass123!`

---

### Test 2: Register with Invalid Email

**What it tests:** Email format validation

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalid-email",
    "password": "SecurePass123!"
  }'
```

**Expected response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

### Test 3: Register with Invalid Username

**What it tests:** Username pattern validation

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@123",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username can only contain letters, numbers, underscores, and hyphens"
    }
  ]
}
```

✅ **Valid usernames:** `john_doe`, `user-123`, `testUser`, `test123`

---

### Test 4: Register with Short Username

**What it tests:** Username length validation

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username must be 3-30 characters"
    }
  ]
}
```

---

## 🔐 Testing Authentication & Account Lockout

### Test 5: Successful Registration

**What it tests:** Valid registration with all correct data

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the `token` for later tests.

---

### Test 6: Login with Correct Credentials

**What it tests:** Successful login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Test 7: Login with Wrong Password (Account Lockout)

**What it tests:** Failed login attempts trigger account lockout

Run this command **5 times** to trigger account lockout:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123!"
  }'
```

**Expected response (attempts 1-4, 401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Expected response (attempt 5, 423 Locked):**
```json
{
  "error": "Account locked",
  "message": "Too many failed login attempts. Please try again in 2 hours.",
  "retryAfter": "2026-03-07T16:30:00.000Z"
}
```

✅ **What happened:** Account is now locked for 2 hours due to 5 failed login attempts.

---

### Test 8: Check Logs for Security Events

**What it tests:** Verify logging is working

In the server terminal, you should see logs like:
```
[2026-03-07T14:30:15.123Z] [INFO] Login attempt { email: 'john@example.com', ip: '::1' }
[2026-03-07T14:30:20.456Z] [WARN] Login failed - invalid password { userId: '...', email: 'john@example.com', ip: '::1', attempts: 1 }
[2026-03-07T14:30:45.789Z] [SECURITY] Login blocked - account locked { userId: '...', email: 'john@example.com', lockedUntil: '2026-03-07T16:30:45.789Z' }
```

Check the logs folder:
```bash
cd server/logs
dir
# You should see: security.log, info.log, warn.log, error.log
cat security.log
```

---

## ⏱️ Testing Rate Limiting

### Test 9: Login Rate Limiting

**What it tests:** Rate limit on login attempts (5 per 15 minutes)

Make 6 rapid login requests:

```bash
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "AnyPass123!"
    }'
  echo "\n"
done
```

**Expected response (6th request, 429 Too Many Requests):**
```json
{
  "error": "Too many attempts",
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfter": "2026-03-07T14:45:00.000Z"
}
```

✅ **What happened:** After 5 requests in 15 minutes, further login attempts are blocked.

---

### Test 10: General Rate Limiting

**What it tests:** General rate limit (100 per 15 minutes per IP)

This is harder to demonstrate manually, but you can verify it's working by checking response headers:

```bash
curl -I http://localhost:5000/health
```

Look for headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1646667900
```

---

## 🔒 Testing Password Security

### Test 11: Change Password

**What it tests:** Secure password change with current password verification

First, get a valid token by logging in, then:

```bash
curl -X PATCH http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456@"
  }'
```

**Expected response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

### Test 12: Change Password with Wrong Current Password

**What it tests:** Password validation

```bash
curl -X PATCH http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "WrongPassword123!",
    "newPassword": "NewSecurePass456@"
  }'
```

**Expected response (401 Unauthorized):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### Test 13: Change Password with Weak New Password

**What it tests:** New password strength validation

```bash
curl -X PATCH http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "weak"
  }'
```

**Expected response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "newPassword",
      "message": "New password must contain uppercase, lowercase, number, and special character"
    }
  ]
}
```

---

## 🛡️ Testing Authorization

### Test 14: Access Protected Route Without Token

**What it tests:** Routes requiring authentication reject unauthenticated requests

```bash
curl http://localhost:5000/api/auth/profile
```

**Expected response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "No authorization token provided"
}
```

---

### Test 15: Access Protected Route with Invalid Token

**What it tests:** Invalid tokens are rejected

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

---

### Test 16: Access Protected Route with Valid Token

**What it tests:** Valid tokens grant access

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_VALID_TOKEN_HERE"
```

**Expected response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2026-03-07T12:00:00.000Z"
  }
}
```

---

### Test 17: Token Expiration

**What it tests:** Expired tokens are rejected

1. Get a valid token by logging in
2. Wait for token to expire (currently set to 15 minutes)
3. Try to use the expired token

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

**Expected response (401 Unauthorized):**
```json
{
  "error": "Token Expired",
  "message": "Please login again"
}
```

---

## ❌ Testing Error Handling

### Test 18: 404 Not Found

**What it tests:** Non-existent routes return proper 404 errors

```bash
curl http://localhost:5000/api/nonexistent
```

**Expected response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Route GET /api/nonexistent does not exist"
}
```

---

### Test 19: Production Error Messages (No Stack Traces)

**What it tests:** In production mode, error details are hidden

Set `NODE_ENV=production` and trigger an error:

```bash
NODE_ENV=production npm run dev
```

Then trigger an error - you should see generic message without stack trace:

```json
{
  "error": "Error",
  "message": "Something went wrong. Please try again later."
}
```

In development mode (`NODE_ENV=development`), you'll see full stack traces.

---

## 🤖 Automated Testing Commands

### Create a Test Script

Create `server/test-security.sh`:

```bash
#!/bin/bash

echo "🧪 Starting Security Tests..."
echo "======================================"

# Test 1: Password Validation
echo "Test 1: Testing weak password rejection..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","email":"test1@example.com","password":"weak"}' 2>/dev/null | grep -q "Validation failed" && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Email Validation
echo "Test 2: Testing email validation..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test2","email":"invalid","password":"SecurePass123!"}' 2>/dev/null | grep -q "Validation failed" && echo "✅ PASS" || echo "❌ FAIL"

# Test 3: Valid Registration
echo "Test 3: Testing valid registration..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"SecurePass123!"}' 2>/dev/null | grep -q "token" && echo "✅ PASS" || echo "❌ FAIL"

# Test 4: 404 Handler
echo "Test 4: Testing 404 handler..."
curl http://localhost:5000/api/nonexistent 2>/dev/null | grep -q "Not Found" && echo "✅ PASS" || echo "❌ FAIL"

# Test 5: Protected Route Without Token
echo "Test 5: Testing protected route without token..."
curl http://localhost:5000/api/auth/profile 2>/dev/null | grep -q "Unauthorized" && echo "✅ PASS" || echo "❌ FAIL"

echo "======================================"
echo "🧪 Tests Complete!"
```

Run it:
```bash
chmod +x server/test-security.sh
./server/test-security.sh
```

---

## 📊 Monitoring Security Events

### View Security Logs

```bash
# All security events
cat server/logs/security.log

# Last 10 security events
tail -10 server/logs/security.log

# Search for failed logins
grep "invalid password" server/logs/security.log

# Search for account lockouts
grep "account locked" server/logs/security.log

# Real-time monitoring
tail -f server/logs/security.log
```

---

## 🎯 Security Testing Checklist

Run through these tests to verify all security features:

```
✅ Input Validation Tests
  [ ] Weak password rejected
  [ ] Invalid email rejected
  [ ] Invalid username rejected
  [ ] Short username rejected

✅ Authentication Tests
  [ ] Valid registration works
  [ ] Valid login works
  [ ] Wrong password rejected
  [ ] Account lockout after 5 attempts
  [ ] Locked account can't login

✅ Rate Limiting Tests
  [ ] Login rate limiting works (5 per 15 min)
  [ ] General rate limiting works (100 per 15 min)
  [ ] Rate limit headers present

✅ Password Security Tests
  [ ] Password change requires current password
  [ ] Wrong current password rejected
  [ ] New password must be strong
  [ ] Passwords properly hashed

✅ Authorization Tests
  [ ] Protected routes require token
  [ ] Invalid token rejected
  [ ] Valid token grants access
  [ ] Expired token rejected

✅ Error Handling Tests
  [ ] 404 for non-existent routes
  [ ] Error messages don't expose internals
  [ ] Production hides stack traces
  [ ] All errors logged properly

✅ Logging Tests
  [ ] Login attempts logged
  [ ] Failed logins logged
  [ ] Account lockouts logged
  [ ] Security events logged
  [ ] Logs are written to files
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

In `.env`:
```
LOG_LEVEL=debug
```

### View Real-time Logs

```bash
# In another terminal
tail -f server/logs/debug.log
```

### Check Account Lock Status

```bash
# Connect to MongoDB
mongo
use dead-poets-society
db.users.findOne({email: "john@example.com"}).pretty()

# Check these fields:
# - loginAttempts: number of failed attempts
# - lockUntil: when account will be unlocked
```

---

## 🚀 Next Steps

1. ✅ Run all tests above
2. ✅ Check logs to verify events are recorded
3. ✅ Monitor security.log for any issues
4. ✅ Once confident, move to production testing with HTTPS
5. ✅ Set up monitoring and alerting for security events

