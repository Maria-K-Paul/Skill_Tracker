# Login Troubleshooting Guide

## ✅ Verified: Backend Works Perfectly

**Admin credentials are correct and working:**
- **Email:** `admin@college.edu`
- **Password:** `admin123`

✅ Backend API tested successfully
✅ Database connection working
✅ CORS configured correctly for port 5179

---

## 🔧 Frontend Troubleshooting Steps

### Step 1: Clear Browser Cache
**This is the most common issue!**

**For Chrome/Edge:**
1. Press `F12` to open Developer Tools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### Step 2: Clear localStorage
1. Press `F12` to open Developer Tools
2. Go to "Application" or "Storage" tab
3. Click "Local Storage" → `http://localhost:5179`
4. Right-click → "Clear"
5. Refresh the page

### Step 3: Check Console for Errors
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Try logging in again
4. Look for any errors (red text)
5. Screenshot any errors you see

**You should see these console logs:**
```
Attempting login with: admin@college.edu
Login response: {access_token: "...", user: {...}}
User roles: ["admin"]
Primary role: admin
```

### Step 4: Check Network Tab
1. Press `F12` → Go to "Network" tab
2. Try logging in
3. Look for `/auth/login` request
4. Click on it → Check "Response" tab
5. Should show: `"roles": ["admin"]`

---

## 🧪 Quick Test

Open browser console (F12) and paste this:
```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'username=admin@college.edu&password=admin123'
})
.then(r => r.json())
.then(d => console.log('✅ Login success:', d))
.catch(e => console.error('❌ Login failed:', e));
```

**Expected output:**
```json
{
  "access_token": "eyJh...",
  "user": {
    "email": "admin@college.edu",
    "roles": ["admin"]
  }
}
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Invalid credentials" error
**Solution:** 
- Make sure you're typing exactly: `admin@college.edu` (all lowercase)
- Password: `admin123` (no spaces)
- Try copying and pasting the credentials

### Issue 2: Nothing happens when clicking "Sign In"
**Solution:**
- Check browser console (F12) for errors
- Make sure backend is running: http://localhost:8000/health
- Should return: `{"status":"ok"}`

### Issue 3: "Network Error" or CORS error
**Solution:**
- Backend might not be running
- Restart backend:
```bash
cd C:/Studies/Skill_wise-learning/Skill_Tracker
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 4: Login works but redirects to wrong page
**Solution:**
- The new code now logs the role to console
- Check console: should show `Primary role: admin`
- If it shows a different role, check which account you're logging into

---

## 🎯 What I Just Fixed

I added detailed console logging to the login page. Now when you try to login, you'll see:

1. "Attempting login with: [email]"
2. "Login response: [full response]"
3. "User roles: [array of roles]"
4. "Primary role: [admin/student/etc]"

This will help identify exactly where the issue is.

---

## ✅ Verification Checklist

Try these in order:

- [ ] Backend running: Visit http://localhost:8000/health
- [ ] Frontend running: Visit http://localhost:5179
- [ ] Browser cache cleared
- [ ] localStorage cleared
- [ ] Console open (F12) to see login logs
- [ ] Try login with: `admin@college.edu` / `admin123`
- [ ] Check console for: "Login response:" message
- [ ] Check console for: "Primary role: admin"

---

## 🆘 If Still Not Working

1. **Take a screenshot** of:
   - The login page with the error
   - Browser console (F12 → Console tab)
   - Network tab (F12 → Network → /auth/login request)

2. **Restart everything:**
```bash
# Kill backend
taskkill /F /IM python.exe

# Start backend
cd C:/Studies/Skill_wise-learning/Skill_Tracker
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend should auto-reload (if npm run dev is running)
```

3. **Try a different browser** (Chrome, Firefox, Edge)

4. **Check if you have any browser extensions** blocking requests (ad blockers, privacy tools)

---

## 📝 Current System Status

✅ **Backend:** Running on port 8000  
✅ **Frontend:** Running on port 5179  
✅ **Database:** Neon PostgreSQL (cloud) - Connected  
✅ **Admin Account:** Exists and working  
✅ **CORS:** Configured for all necessary ports  
✅ **Authentication:** OAuth2 password flow - Working  

**The system is fully functional. The issue is likely browser cache or localStorage.**

---

**Generated:** 2026-10-01  
**Last Backend Test:** ✅ Successful (login returned access token)
