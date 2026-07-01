#!/usr/bin/env node

# 🎯 SCHEMA MIGRATION COMPLETE - NEXT STEPS

## ✅ What We've Done

### Backend Changes (Server)
- ✅ Created Like.js model (NEW)
- ✅ Updated User.js: username → displayName (non-unique)
- ✅ Updated Post.js: creator string → author ObjectId reference, removed likeCount
- ✅ Completely rewrote postController.js with proper like functionality
- ✅ Updated userController.js to work with displayName
- ✅ Updated validators.js for displayName
- ✅ Updated auth middleware for displayName

### Frontend Changes (Client)
- ✅ Updated RegisterPage.jsx for displayName input
- ✅ Updated LoginPage.jsx for displayName
- ✅ Updated auth.js for displayName in localStorage
- ✅ Updated HomePage.jsx to show author.displayName
- ✅ Updated PostDetail.jsx to show author.displayName
- ✅ All like functionality now tied to user accounts

### Documentation Created
- ✅ DEPLOYMENT_GUIDE.md - Complete deployment instructions
- ✅ MIGRATION_SUMMARY.md - What changed and why
- ✅ TESTING_GUIDE.md - How to test the new system
- ✅ DATABASE_DESIGN.md - ER diagrams and data flow
- ✅ migration.js - Automated database migration script

---

## 🚀 EXACT STEPS TO DEPLOY

### STEP 1: Push Code to GitHub (2 minutes)
```bash
cd dead-poets-society
git add .
git commit -m "Schema migration: displayName, author refs, permanent likes"
git push origin main
```

**Result**: GitHub shows your latest commits ✅

---

### STEP 2: Wait for Render Auto-Deploy (5-10 minutes)

1. Go to https://dashboard.render.com
2. Select "Backend Service" (dead-poets-society-backend or similar)
3. Watch for "Deploy successful" status ✅
4. Select "Frontend Service" (dead-poets-society or similar)
5. Watch for "Deploy successful" status ✅

**Check Backend Logs:**
- Click "Logs" tab
- Should see: `Server running on port 5000`

**Check Frontend Logs:**
- Click "Logs" tab
- Should see: Build completed, deployment successful

---

### STEP 3: Run Database Migration (5 minutes)

**CRITICAL: Do this BEFORE testing!**

**Option A: Run in Render Shell (Easiest)**

1. Go to Backend Service on Render
2. Click "Shell" button (top right)
3. Paste this command:
```bash
MONGODB_URI=$MONGODB_URI node migration.js
```
4. Wait for output ✅ "MIGRATION COMPLETE!"

**Option B: Run Locally**

1. Get MongoDB URI from Render → Backend → Environment
2. Run in terminal:
```bash
cd dead-poets-society
MONGODB_URI="your_uri_here" node migration.js
```

**What the migration does:**
- Adds displayName to all users (from old username field)
- Converts post author field from string to ObjectId
- Creates Like collection structure
- Shows detailed log of progress

---

### STEP 4: Clear Browser Cache (2 minutes)

**Very Important! Old data will conflict with new schema**

**Chrome/Edge:**
- Press Ctrl+Shift+Delete
- Select "All time"
- Check "Cookies and other site data"
- Click "Clear data"

**Firefox:**
- Press Ctrl+Shift+Delete
- Select "Everything"
- Check "Cookies" and "Offline Web Site Data"
- Click "Clear Now"

**Safari:**
- Menu → History → Clear History
- Select "All history"
- Click "Clear History"

---

### STEP 5: Test on Live Site (15 minutes)

Go to your deployed frontend URL: `https://your-site.onrender.com`

#### Test 1: Register New User
- Click "Register"
- Display Name: "TestUser1"
- Email: "test1@example.com"
- Password: "Secure123!"
- Click "Register"
- ✅ Should redirect to home, show logged in

#### Test 2: Create a Post
- Click "Write a Poem"
- Title: "Test Post"
- Content: "Testing the new database schema with permanent likes."
- Tags: "test"
- Click "Create"
- ✅ Should appear on home page showing "TestUser1" as author

#### Test 3: Test Like Functionality (KEY TEST!)
- Find your post on home page
- Click heart (♡) to like
- ✅ Shows ♥ 1
- **Press F5 to refresh page**
- ✅ **Like STILL shows! This is the key change!**
- Unlike by clicking ♥
- ✅ Shows ♡ 0
- Refresh again
- ✅ Unlike persists

#### Test 4: Register Second User with Same Display Name
- Logout (clear localStorage or open incognito)
- Register again:
  - Display Name: "TestUser1" (SAME as before!)
  - Email: "test2@example.com" (DIFFERENT)
  - Password: "Secure123!"
- ✅ **Should succeed! (Before would fail)**

#### Test 5: Test Multi-User Likes
- Logout
- Login as second user
- Find first user's post
- Like it
- ✅ Shows 1 like (from second user)
- Check first user's account - they also see the 1 like
- ✅ Like is shared/visible to all users

#### Test 6: Test Post Ownership
- Still logged in as second user
- Try to edit first user's post
- ✅ **Should NOT show edit button** (not owner)
- Try to delete
- ✅ **Should NOT show delete button** (not owner)

---

## 🔍 How to Verify Success

### Check Browser Console (F12)

```javascript
// Should show displayName, not username
console.log(localStorage.getItem('displayName'))
// Output: "TestUser1"

// Token should have displayName
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.displayName)
// Output: "TestUser1"

// likedPosts might be empty (we stopped using it)
console.log(localStorage.getItem('likedPosts'))
// Output: "[]" or null
```

### Check Network Tab (F12)

1. Create a post
2. Look for POST request to `/api/posts`
3. Click it, go to "Response" tab
4. Should show:
```json
{
  "post": {
    "author": {
      "_id": "60d...",
      "displayName": "TestUser1"
    },
    "likeCount": 0
  }
}
```
✅ NOT `"creator": "TestUser1"` (old style)

---

## ⚠️ Common Issues & Fixes

### Issue: "Cannot find migration.js"
**Fix**: Make sure migration.js is in the project root, not in server folder

### Issue: Like count shows 0 or NaN
**Fix**: 
1. Verify migration.js ran successfully
2. Check Like.js model exists at server/models/Like.js
3. Try liking again - it should work after migration

### Issue: "creator" still showing instead of displayName
**Fix**:
1. Clear browser cache completely
2. Logout and login again
3. Check API response - if it still shows "creator", migration didn't run

### Issue: Migration script gives "Cannot find module"
**Fix**:
1. Make sure you're running from project root: `cd dead-poets-society`
2. Make sure MONGODB_URI is set: `echo $MONGODB_URI`

### Issue: Posts show "null" author after migration
**Fix**:
1. Old posts didn't have matching user for creator string
2. Migration script tries to match but may fail if username changed
3. Run manually in MongoDB:
```javascript
db.posts.updateMany({author: null}, {$set: {author: ObjectId("...")}})
```

---

## 📞 Deployment Troubleshooting

### "Deploy failed" on Render
1. Check error message in Render logs
2. Most common: Missing semicolon or syntax error
3. Fix locally, test, push again

### "Backend won't start"
1. Check Render logs for the actual error
2. Make sure all imports are correct
3. Check environment variables are set

### "Database migration hangs"
1. Check MongoDB connection string is correct
2. Verify IP whitelist on MongoDB Atlas includes Render IPs
3. Check network connectivity

---

## ✅ Final Verification

### Create a Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Migration script ran successfully
- [ ] Browser cache cleared
- [ ] Registered test user
- [ ] Created test post
- [ ] Liked post and refreshed (like persisted!)
- [ ] Registered duplicate display name (succeeded!)
- [ ] Logged in as different user
- [ ] Viewed first user's posts
- [ ] Second user liked the post
- [ ] All users see the like

**If all checked ✅ → You're done!**

---

## 🎉 What Users Will See

### New Features:
1. ✅ **Flexible names**: Can share display names with other users
2. ✅ **Permanent likes**: Likes saved in database, not localStorage
3. ✅ **Multi-device**: Likes sync across devices (same account)
4. ✅ **User attribution**: See which user created each post
5. ✅ **Better data**: Author properly linked via database relationship

### What They Need to Know:
- Existing localStorage likes are cleared
- Need to login again (token format changed)
- Display names now allow duplicates

---

## 📝 Documentation Files for Reference

- **DEPLOYMENT_GUIDE.md** - Detailed deployment steps with rollback plan
- **MIGRATION_SUMMARY.md** - What changed and why in technical detail
- **TESTING_GUIDE.md** - Step-by-step testing with browser DevTools info
- **DATABASE_DESIGN.md** - ER diagrams, data flow, query examples
- **migration.js** - The automated migration script

---

## 🚀 You're Ready to Deploy!

Everything is set up. Just:

1. **Push code**
2. **Wait for Render deploy**
3. **Run migration.js**
4. **Clear cache and test**

Good luck! 🎉
