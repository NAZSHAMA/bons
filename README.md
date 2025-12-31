# Bonsai - Full Stack Task Manager

A modern task management application built with Next.js 16 frontend and FastAPI backend, featuring UV package management, Pydantic validation, and APScheduler for cron jobs.

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Next.js 16        │         │   FastAPI           │
│   Frontend          │◄────────►   Backend           │
│                     │  HTTP   │                     │
│  - TypeScript       │         │  - Python 3.11      │
│  - Tailwind CSS     │         │  - Pydantic v2      │
│  - React Hooks      │         │  - APScheduler      │
│                     │         │  - UV Package Mgmt  │
└─────────────────────┘         └─────────────────────┘
      Port 3000                       Port 8000
```

## Features

### Frontend (Next.js 16)
- JWT authentication with login/register
- User profile display with logout
- Modern UI with Tailwind CSS
- Real-time task management (CRUD operations)
- Task filtering (All, Active, Completed)
- Statistics dashboard
- Protected routes and auth guards
- Responsive design
- Type-safe API integration

### Backend (FastAPI + UV)
- JWT token authentication (OAuth2)
- Argon2 password hashing
- User registration and login
- Protected API endpoints
- User-specific data isolation
- RESTful API with automatic documentation
- Pydantic data validation
- CORS middleware configured
- SQLAlchemy 2.0 with async support
- SQLite database with user relationships
- Cron job scheduling (APScheduler)
  - Daily cleanup tasks
  - Hourly sync operations
  - Custom scheduled jobs
- UV for fast Python package management

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 16 (App Router) |
| **Frontend Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Backend Framework** | FastAPI |
| **Backend Language** | Python 3.11+ |
| **Package Manager** | UV (Python), npm (Node) |
| **Validation** | Pydantic v2 |
| **Database** | SQLite (with SQLAlchemy 2.0) |
| **Authentication** | JWT (python-jose, Argon2) |
| **Task Scheduler** | APScheduler |
| **HTTP Client** | Fetch API |

## Project Structure

```
bonsai/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── page.tsx            # Main task manager page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── TaskList.tsx        # Task list display
│   │   └── TaskForm.tsx        # Task creation form
│   ├── lib/
│   │   ├── api-client.ts       # HTTP client
│   │   └── services/
│   │       └── task-service.ts # Task API methods
│   ├── types/
│   │   └── api.ts              # TypeScript interfaces
│   ├── .env.local              # Environment variables
│   └── package.json
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── config.py           # Settings management
│   │   ├── database.py         # Database connection
│   │   ├── models/
│   │   │   ├── schemas.py      # Pydantic models
│   │   │   └── database.py     # SQLAlchemy models
│   │   ├── routes/
│   │   │   └── tasks.py        # Task endpoints
│   │   └── cron/
│   │       └── scheduler.py    # Cron job setup
│   ├── .env                    # Environment variables
│   ├── bonsai.db               # SQLite database
│   ├── DATABASE.md             # Database documentation
│   └── pyproject.toml          # UV configuration
│
└── PROJECT_SPECIFICATION.md    # Detailed specification
```

## Quick Start

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- UV package manager for Python
- npm for Node.js

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies with UV:
```bash
uv sync
```

3. Start the FastAPI server:
```bash
uv run uvicorn app.main:app --reload --port 8000
```

The backend will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## API Endpoints

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/` | Get all tasks |
| POST | `/tasks/` | Create a new task |
| GET | `/tasks/{id}` | Get task by ID |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/toggle` | Toggle completion status |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |

## Environment Variables

### Backend (.env)
```env
APP_NAME=Bonsai API
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
DATABASE_URL=sqlite:///./bonsai.db
ENABLE_CRON_JOBS=true
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Cron Jobs

The backend includes scheduled tasks:

1. **Daily Cleanup** - Runs at 00:00
   - Cleans old data and temporary files

2. **Hourly Sync** - Runs every hour at :00
   - Synchronizes data and updates cache

3. **Test Task** - Runs every minute (for development)
   - Remove or disable in production

Configure in `backend/app/cron/scheduler.py`

## Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
  - Test endpoints directly
  - View request/response schemas
  - See all available operations

- **ReDoc**: http://localhost:8000/redoc
  - Alternative documentation interface
  - Better for reading and reference

## Features Walkthrough

### Create Tasks
1. Enter task title (required)
2. Add optional description
3. Click "Create Task"

### Manage Tasks
- Click checkbox to toggle completion
- Click trash icon to delete
- View creation and update timestamps

### Filter Tasks
- **All** - Show all tasks
- **Active** - Show incomplete tasks only
- **Completed** - Show completed tasks only

### Statistics
- Real-time task counts
- Active vs completed breakdown
- Total task overview

## Production Deployment

### Backend
1. Set `DEBUG=false` in environment
2. Use production ASGI server:
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
3. Configure production database
4. Set secure CORS origins
5. Use strong secret keys

### Frontend
1. Build the application:
```bash
npm run build
```
2. Start production server:
```bash
npm start
```
3. Update `NEXT_PUBLIC_API_URL` to production API
4. Deploy to Vercel, Netlify, or custom hosting

## Extending the Application

### Adding Database Support
1. Install SQLAlchemy: `uv add sqlalchemy`
2. Create database models in `backend/app/models/`
3. Set up database connection in `config.py`
4. Update routes to use database instead of in-memory storage

### Adding Authentication
1. Install required packages: `uv add python-jose passlib`
2. Create auth routes and middleware
3. Add JWT token handling
4. Update frontend to include auth headers

### Adding More Features
- Task categories/tags
- Due dates and reminders
- User accounts and sharing
- Task priorities
- Search and advanced filtering

## Troubleshooting

### Backend Won't Start
- Ensure Python 3.11+ is installed
- Check if port 8000 is available
- Verify UV dependencies are installed

### Frontend Won't Start
- Ensure Node.js 18+ is installed
- Check if port 3000 is available
- Delete `node_modules` and reinstall

### CORS Errors
- Verify backend CORS_ORIGINS includes frontend URL
- Check that both servers are running
- Ensure environment variables are loaded

## License

MIT License - Feel free to use this project as a template for your applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Check the PROJECT_SPECIFICATION.md for detailed documentation
- Review FastAPI docs: https://fastapi.tiangolo.com
- Review Next.js docs: https://nextjs.org/docs

---

Built with Next.js 16, FastAPI, UV, Pydantic, and APScheduler
