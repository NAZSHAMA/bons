# Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ "Invalid username or password" Error

### Problem
You're seeing this error when trying to login.

### Root Cause
You're trying to login with a username that **doesn't exist yet** in the database.

### Solution
**You must REGISTER first before you can LOGIN!**

#### Steps to Fix:

1. **On the login page**, look at the bottom
2. Click the **"Sign up"** link
3. **Fill in the registration form:**
   ```
   Username: Your chosen username
   Email: Your email address
   Password: At least 8 characters
   Confirm Password: Same password
   ```
4. Click **"Create Account"**
5. You'll be automatically logged in!

#### Why This Happens:
- Login checks if the username exists in the database
- If you never registered, the username doesn't exist
- The error message is intentionally vague for security (doesn't reveal if username exists)

---

## ❌ Cannot Access Task Manager

### Problem
You're redirected back to login page when trying to access tasks.

### Solution
You need to be logged in with a valid account.

**Steps:**
1. Register a new account (click "Sign up")
2. Or login with an existing account
3. You'll automatically be redirected to the task manager

---

## ❌ Tasks Not Showing

### Problem
After login, no tasks appear.

### This is Normal!
- New accounts start with zero tasks
- You need to create tasks using the form

**Steps:**
1. Look for "Create New Task" section
2. Enter a task title
3. Click "Create Task"
4. Your task will appear below

---

## ❌ "Not authenticated" Error

### Problem
Getting 401 errors when trying to access tasks.

### Solutions:

**Option 1: Login Again**
- Your token may have expired (30-minute lifetime)
- Go to /auth and login again

**Option 2: Clear Browser Storage**
```javascript
// In browser console:
localStorage.clear()
// Then refresh page and login again
```

**Option 3: Check Backend is Running**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"bonsai-api"}
```

---

## ❌ Frontend Won't Load

### Checklist:

1. **Is the frontend server running?**
   ```bash
   cd frontend
   npm run dev
   ```
   Look for: "✓ Ready in..."

2. **Check the port**
   - Should be http://localhost:3000
   - Try http://127.0.0.1:3000

3. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## ❌ Backend Errors

### "Connection refused" or "Cannot connect"

**Backend not running:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Port already in use:**
```bash
# Use different port
uv run uvicorn app.main:app --reload --port 8001

# Update frontend .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## ❌ CORS Errors

### Problem
Browser console shows CORS errors.

### Solution
Check backend .env has correct CORS origins:

```env
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

Restart backend after changes.

---

## ❌ Email Verification Link Not Working

### In Development Mode
Email verification is **disabled by default** in development.

Check backend console for:
```
================================================================================
EMAIL VERIFICATION (Development Mode)
================================================================================
To: your@email.com
Verification Link: http://localhost:3000/verify-email?token=...
================================================================================
```

**Copy the verification link** from console and paste in browser.

### To Enable Email in Production
Update backend .env:
```env
MAIL_ENABLED=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## ❌ Database Errors

### "Database is locked"

SQLite doesn't handle concurrent writes well.

**Solutions:**
1. Use PostgreSQL for production
2. Restart both servers
3. Delete and recreate database:
   ```bash
   rm backend/bonsai.db
   # Restart backend (will recreate tables)
   ```

---

## ❌ Password Not Working After Registration

### Check These:

1. **Did you complete registration?**
   - Look for success message
   - Should auto-login after registration

2. **Are you using the correct username?**
   - Use username, NOT email for login
   - Username is what you chose during registration

3. **Password requirements:**
   - Minimum 8 characters
   - Case-sensitive

---

## 🔧 Reset Everything

If nothing works, start fresh:

```bash
# 1. Stop both servers (Ctrl+C in terminals)

# 2. Delete database
rm backend/bonsai.db

# 3. Clear browser storage
# In browser console:
localStorage.clear()

# 4. Restart backend
cd backend
uv run uvicorn app.main:app --reload --port 8000

# 5. Restart frontend
cd frontend
npm run dev

# 6. Open browser
# Visit http://localhost:3000
# Register a new account
```

---

## 🧪 Test Account

For quick testing, use these credentials (after registering):

**Registration:**
- Username: `demo`
- Email: `demo@example.com`
- Password: `demo1234`

**Login:**
- Username: `demo`
- Password: `demo1234`

---

## 🔍 Debugging Tips

### Check Backend Logs
Watch the terminal running uvicorn for:
- Registration: "POST /auth/register HTTP/1.1" 201
- Login: "POST /auth/login/json HTTP/1.1" 200 (success) or 401 (failed)
- User lookup: "SELECT users... WHERE users.username = ?"

### Check Frontend Console
Open browser DevTools (F12):
- **Console tab**: Look for errors
- **Network tab**: Check API calls
  - Failed requests show in red
  - Click on request to see details

### Check Database
```bash
# View all users
cd backend
python -c "import sqlite3; conn = sqlite3.connect('bonsai.db'); print(conn.execute('SELECT username, email FROM users').fetchall())"
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] You registered an account first
- [ ] Using username (not email) for login
- [ ] Password is correct and at least 8 characters
- [ ] Browser console has no errors
- [ ] Backend console shows no errors

---

## 📞 Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Can't login | Register first with "Sign up" |
| No tasks showing | Create tasks using the form |
| Redirected to login | You need to authenticate |
| CORS error | Check backend CORS_ORIGINS |
| Port in use | Use different port |
| Database locked | Restart servers |

---

## 🎯 Common User Mistakes

1. **Trying to login without registering first** ⚠️
   - Fix: Click "Sign up" and create account

2. **Using email instead of username for login** ⚠️
   - Fix: Use your username (not email)

3. **Forgetting password requirements** ⚠️
   - Fix: Use at least 8 characters

4. **Backend not running** ⚠️
   - Fix: Start backend server

5. **Expired token (after 30 minutes)** ⚠️
   - Fix: Login again

---

## 💡 Pro Tips

- **First time?** Always register before attempting login
- **Forgot username?** Check backend console logs or database
- **Testing?** Use simple credentials: demo/demo1234
- **Production?** Enable email verification and use strong passwords

---

**Still having issues?** Check the relevant documentation:
- Authentication: COMPLETE_AUTHENTICATION_GUIDE.md
- Setup: GETTING_STARTED.md
- Database: DATABASE.md

---

**The most common issue is trying to login before registering!**

Just click "Sign up" and create your account first. 🚀
