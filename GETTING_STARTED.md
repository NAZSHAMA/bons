# Getting Started with Bonsai

## Quick Start (5 Minutes)

### Step 1: Start Backend
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Wait for:** "Application startup complete"

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Wait for:** "✓ Ready in..."

### Step 3: Open in Browser
```
http://localhost:3000
```

You'll be redirected to the login page.

---

## First Time Setup

### 1. Register Your Account

When you visit http://localhost:3000, you'll see the login page.

1. Click **"Sign up"**
2. Enter:
   - **Username**: Your username (3-50 characters)
   - **Email**: Your email address
   - **Password**: At least 8 characters
   - **Confirm Password**: Same password
3. Click **"Create Account"**

✅ You'll be automatically logged in and redirected to the task manager!

### 2. Start Managing Tasks

Now you're in the main application:

**You'll see:**
- Your username and email in the header
- Statistics (Total, Active, Completed tasks)
- A form to create new tasks
- Filter buttons (All, Active, Completed)

**Try this:**
1. Enter a task title: "My First Task"
2. Add a description (optional)
3. Click "Create Task"

✅ Your task appears below!

**Task Actions:**
- ✅ **Toggle completion** - Click the checkbox
- ❌ **Delete task** - Click the trash icon
- 📊 **Filter** - Click All/Active/Completed buttons

### 3. Logout & Login

**Logout:**
1. Click the red **"Logout"** button
2. You'll be redirected to the login page
3. Your tasks are saved!

**Login Again:**
1. Enter your username and password
2. Click **"Sign In"**
3. Your tasks are still there!

---

## What You Get

### 🔐 Secure Authentication
- Passwords hashed with Argon2
- JWT tokens (30-minute expiration)
- Your tasks are private to you

### 📝 Task Management
- Create unlimited tasks
- Mark as complete/incomplete
- Add descriptions
- Filter by status
- Real-time statistics

### 💾 Data Persistence
- All data saved to SQLite database
- Survives server restarts
- Your tasks are always there

### ⏰ Background Jobs
- Cron jobs run automatically
- Check backend terminal for:
  ```
  [CRON] Test task executed at...
  ```

---

## Multiple Users

### Create Second Account
1. Logout from first account
2. Click "Sign up"
3. Use different username and email
4. Register

**Result:**
- ✅ Second user has their own tasks
- ✅ First user's tasks are hidden
- ✅ Complete data isolation!

### Test User Isolation
1. Login as User A → Create task "User A Task"
2. Logout
3. Login as User B → Create task "User B Task"
4. User B only sees "User B Task"
5. User A's task is private! ✅

---

## Explore the API

### API Documentation
Visit: http://localhost:8000/docs

**You can:**
1. See all endpoints
2. Test authentication:
   - Click **"Authorize"** button
   - Login to get token
   - Paste token
   - Now you can test protected endpoints!
3. View request/response schemas
4. Try different operations

### Alternative Docs
Visit: http://localhost:8000/redoc

Better for reading and reference.

---

## File Structure

### Frontend
```
frontend/
├── app/
│   ├── page.tsx              # Main task manager (protected)
│   ├── auth/
│   │   └── page.tsx          # Login/Register page
│   └── layout.tsx            # Root with AuthProvider
├── components/
│   ├── LoginForm.tsx         # Login UI
│   ├── RegisterForm.tsx      # Register UI
│   ├── TaskForm.tsx          # Create tasks
│   └── TaskList.tsx          # Display tasks
├── lib/
│   ├── auth-context.tsx      # Auth state management
│   ├── api-client.ts         # HTTP client + auth
│   └── services/
│       ├── auth-service.ts   # Auth API
│       └── task-service.ts   # Task API
└── types/
    └── api.ts                # TypeScript types
```

### Backend
```
backend/
├── app/
│   ├── main.py               # FastAPI app + routers
│   ├── database.py           # DB connection
│   ├── config.py             # Settings
│   ├── utils/
│   │   └── auth.py           # JWT & password utils
│   ├── models/
│   │   ├── database.py       # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── routes/
│   │   ├── auth.py           # Auth endpoints
│   │   └── tasks.py          # Task endpoints (protected)
│   └── cron/
│       └── scheduler.py      # Background jobs
└── bonsai.db                 # SQLite database
```

---

## Common Tasks

### Reset Database
```bash
cd backend
rm bonsai.db
# Restart server (recreates tables)
```

### View Database
```bash
cd backend
sqlite3 bonsai.db

.tables
SELECT * FROM users;
SELECT * FROM tasks;
.quit
```

### Check Logs
**Backend logs**: Watch the terminal running uvicorn
**Frontend logs**: Browser DevTools → Console
**API logs**: Check Network tab in DevTools

### Generate New Secret Key
```bash
openssl rand -hex 32
```

Update in `backend/.env`:
```env
SECRET_KEY=<your-new-key>
```

---

## Troubleshooting

### Cannot Access Main Page
- ✅ Check you're logged in
- ✅ Visit /auth to login
- ✅ Check localStorage has token

### Tasks Not Saving
- ✅ Check backend is running
- ✅ Check browser console for errors
- ✅ Check Network tab for failed requests

### Login Not Working
- ✅ Verify username/password correct
- ✅ Check backend logs for errors
- ✅ Try registering a new account

### Port Already in Use
**Backend:**
```bash
uv run uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
npm run dev -- -p 3001
```

---

## What's Next?

### Try These Features:
1. ✅ Create multiple users
2. ✅ Login/logout multiple times
3. ✅ Create tasks for each user
4. ✅ Verify user isolation
5. ✅ Test token expiration (wait 30 min)

### Explore the Code:
1. 📖 Check auth-context.tsx for state management
2. 📖 Review auth.py for JWT logic
3. 📖 See how routes are protected
4. 📖 Read the authentication guides

### Learn More:
- 📚 COMPLETE_AUTHENTICATION_GUIDE.md - Full details
- 📚 AUTHENTICATION_SUMMARY.md - Backend details
- 📚 FRONTEND_AUTH_GUIDE.md - Frontend details
- 📚 DATABASE.md - Database documentation

---

## Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Auth Page** | http://localhost:3000/auth | Login/Register |
| **Backend API** | http://localhost:8000 | API base URL |
| **API Docs (Swagger)** | http://localhost:8000/docs | Interactive docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc | Reference docs |
| **Health Check** | http://localhost:8000/health | API status |

---

## Quick Test Script

```bash
# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test1234"}'

# Login
curl -X POST http://localhost:8000/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test1234"}'

# Save the access_token from response
TOKEN="<paste-token-here>"

# Create task
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Task","completed":false}'

# Get tasks
curl http://localhost:8000/tasks/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

### Documentation
- ✅ README.md - Main overview
- ✅ QUICKSTART.md - Quick setup
- ✅ PROJECT_SPECIFICATION.md - Technical specs
- ✅ DATABASE.md - Database guide
- ✅ COMPLETE_AUTHENTICATION_GUIDE.md - Auth details
- ✅ FRONTEND_AUTH_GUIDE.md - Frontend auth
- ✅ AUTHENTICATION_SUMMARY.md - Backend auth

### Helpful Commands
```bash
# Backend
cd backend
uv sync                  # Install dependencies
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production

# Database
sqlite3 backend/bonsai.db  # Open database
```

---

**You're all set! Start by visiting http://localhost:3000 and creating your account!** 🚀

The application features:
- 🔐 Secure authentication
- 📝 Personal task management
- 💾 Persistent storage
- ⏰ Background cron jobs
- 🎨 Beautiful UI
- 🔒 Complete user isolation

Enjoy building with Bonsai! 🌳
