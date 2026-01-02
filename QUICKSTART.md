# Quick Start Guide

Get the Bonsai Task Manager up and running in 5 minutes!

## Prerequisites

Ensure you have the following installed:
- ✅ Python 3.11 or higher
- ✅ Node.js 18 or higher
- ✅ UV package manager (for Python)
- ✅ npm (comes with Node.js)

## Installation & Setup

### Step 1: Start the Backend (FastAPI)

Open a terminal and run:

```bash
# Navigate to backend directory
cd backend

# Install dependencies with UV
uv sync

# Start the FastAPI server
uv run uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
INFO:     Cron jobs started successfully
```

**Backend is now running at:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

### Step 2: Start the Frontend (Next.js)

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
▲ Next.js 16.1.1
- Local:         http://localhost:3000
✓ Ready in 2s
```

**Frontend is now running at:** http://localhost:3000

## Test the Application

### Option 1: Web Browser

Open your browser and navigate to:
- **Frontend App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### Option 2: Using the API Directly

```bash
# Create a task
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Task", "description": "Testing the API", "completed": false}'

# Get all tasks
curl http://localhost:8000/tasks/

# Check health
curl http://localhost:8000/health
```

## Features to Try

1. **Create Tasks**
   - Enter a task title
   - Add optional description
   - Click "Create Task"

2. **Manage Tasks**
   - Click checkbox to mark complete
   - Click trash icon to delete
   - View real-time statistics

3. **Filter Tasks**
   - Click "All" to see everything
   - Click "Active" for incomplete tasks
   - Click "Completed" for done tasks

4. **Check Cron Jobs**
   - Watch the backend terminal
   - Every minute you'll see: `[CRON] Test task executed at...`
   - This proves the scheduler is working!

## What's Running?

### Backend (Port 8000)
- ✅ FastAPI REST API
- ✅ Pydantic data validation
- ✅ CORS middleware
- ✅ APScheduler cron jobs (running every minute)
- ✅ Interactive API documentation

### Frontend (Port 3000)
- ✅ Next.js 16 with App Router
- ✅ TypeScript type safety
- ✅ Tailwind CSS styling
- ✅ Real-time task management
- ✅ Responsive design

## Troubleshooting

### Backend won't start?
```bash
# Check Python version
python --version  # Should be 3.11+

# Check if UV is installed
uv --version

# Install UV if missing (macOS/Linux)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install UV if missing (Windows)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Frontend won't start?
```bash
# Check Node version
node --version  # Should be 18+

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use?
```bash
# Backend (change port 8000 to 8001)
uv run uvicorn app.main:app --reload --port 8001

# Frontend (change port 3000 to 3001)
npm run dev -- -p 3001
```

### Can't connect frontend to backend?
- Ensure backend is running on port 8000
- Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Verify CORS origins in `backend/.env` include your frontend URL

## Next Steps

Once everything is running:

1. **Explore the API Documentation**
   - Visit http://localhost:8000/docs
   - Try different endpoints
   - Test with different data

2. **Check the Code**
   - Frontend: `frontend/app/page.tsx`
   - Backend: `backend/app/main.py`
   - API Routes: `backend/app/routes/tasks.py`
   - Cron Jobs: `backend/app/cron/scheduler.py`

3. **Customize**
   - Add new task fields
   - Create custom cron jobs
   - Style the UI with Tailwind
   - Add new API endpoints

4. **Read Full Documentation**
   - See `README.md` for complete overview
   - See `PROJECT_SPECIFICATION.md` for detailed specs

## Stopping the Servers

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

## Need Help?

- 📚 FastAPI Docs: https://fastapi.tiangolo.com
- 📚 Next.js Docs: https://nextjs.org/docs
- 📚 UV Docs: https://docs.astral.sh/uv/
- 📚 Pydantic Docs: https://docs.pydantic.dev

---

Happy coding! 🎉
