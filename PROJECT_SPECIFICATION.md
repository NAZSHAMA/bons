# Project Specification & Constitution

## Project Overview
Full-stack web application with Next.js 16 frontend and FastAPI backend, using UV for Python package management, Pydantic for data validation, and cron scheduling capabilities.

---

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Package Manager**: npm/pnpm/yarn
- **Styling**: TailwindCSS (or CSS Modules)
- **State Management**: React Context API / Zustand
- **HTTP Client**: Fetch API / Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Package Manager**: UV
- **Validation**: Pydantic v2
- **Task Scheduler**: APScheduler / Celery
- **Database**: PostgreSQL / SQLite (to be determined)
- **ORM**: SQLAlchemy (optional)

---

## 2. Project Structure

```
bonsai/
├── frontend/                 # Next.js 16 application
│   ├── app/                 # App router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── api/             # API routes (optional)
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and helpers
│   │   └── api-client.ts    # API client for backend
│   ├── types/               # TypeScript types
│   ├── public/              # Static assets
│   ├── next.config.js       # Next.js configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── package.json         # Frontend dependencies
│
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Configuration management
│   │   ├── models/          # Pydantic models
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── cron/            # Cron job definitions
│   │   ├── middleware/      # CORS, auth, etc.
│   │   └── utils/           # Helper functions
│   ├── tests/               # Backend tests
│   ├── pyproject.toml       # UV project configuration
│   └── uv.lock              # UV lock file
│
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── docker-compose.yml       # Docker configuration (optional)
└── README.md                # Project documentation
```

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Backend Setup with UV & FastAPI

#### Step 1.1: Initialize UV Project
```bash
cd backend
uv init
uv add fastapi uvicorn pydantic pydantic-settings
```

**Files to create:**
- `backend/pyproject.toml` - UV project configuration
- `backend/app/main.py` - FastAPI application entry point

#### Step 1.2: Configure FastAPI Application
**File**: `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Bonsai API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Bonsai API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### Step 1.3: Create Pydantic Models
**File**: `backend/app/models/schemas.py`
```python
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

#### Step 1.4: Create API Routes
**File**: `backend/app/routes/tasks.py`
```python
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import TaskCreate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

# In-memory storage (replace with database)
tasks_db = []

@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    # Implementation
    pass

@router.get("/", response_model=List[TaskResponse])
async def get_tasks():
    return tasks_db

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int):
    # Implementation
    pass

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task: TaskCreate):
    # Implementation
    pass

@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: int):
    # Implementation
    pass
```

#### Step 1.5: Setup Cron Jobs
**Dependencies:**
```bash
uv add apscheduler
```

**File**: `backend/app/cron/scheduler.py`
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

scheduler = AsyncIOScheduler()

async def daily_cleanup_task():
    """Runs daily at midnight"""
    print(f"Running daily cleanup at {datetime.now()}")
    # Add cleanup logic here

async def hourly_sync_task():
    """Runs every hour"""
    print(f"Running hourly sync at {datetime.now()}")
    # Add sync logic here

def setup_cron_jobs():
    # Daily task at midnight
    scheduler.add_job(
        daily_cleanup_task,
        CronTrigger(hour=0, minute=0),
        id="daily_cleanup",
        replace_existing=True
    )

    # Hourly task
    scheduler.add_job(
        hourly_sync_task,
        CronTrigger(minute=0),
        id="hourly_sync",
        replace_existing=True
    )

    scheduler.start()
```

#### Step 1.6: Update Main Application
**File**: `backend/app/main.py` (updated)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes import tasks
from app.cron.scheduler import setup_cron_jobs, scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_cron_jobs()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(
    title="Bonsai API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Bonsai API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### Step 1.7: Environment Configuration
**File**: `backend/app/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Bonsai API"
    debug: bool = False
    api_prefix: str = "/api/v1"
    cors_origins: list = ["http://localhost:3000"]

    # Database
    database_url: str = "sqlite:///./bonsai.db"

    class Config:
        env_file = ".env"

settings = Settings()
```

**File**: `backend/.env.example`
```
APP_NAME=Bonsai API
DEBUG=true
DATABASE_URL=sqlite:///./bonsai.db
CORS_ORIGINS=http://localhost:3000
```

---

### Phase 2: Frontend Setup with Next.js 16

#### Step 2.1: Initialize Next.js Project
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
```

#### Step 2.2: Project Configuration
**File**: `frontend/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
```

**File**: `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Step 2.3: Create API Client
**File**: `frontend/lib/api-client.ts`
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

#### Step 2.4: Define TypeScript Types
**File**: `frontend/types/api.ts`
```typescript
export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

#### Step 2.5: Create API Service
**File**: `frontend/lib/services/task-service.ts`
```typescript
import { apiClient } from '../api-client';
import { Task, TaskCreate } from '@/types/api';

export const taskService = {
  getTasks: () => apiClient.get<Task[]>('/tasks'),

  getTask: (id: number) => apiClient.get<Task>(`/tasks/${id}`),

  createTask: (data: TaskCreate) => apiClient.post<Task>('/tasks', data),

  updateTask: (id: number, data: TaskCreate) =>
    apiClient.put<Task>(`/tasks/${id}`, data),

  deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`),
};
```

#### Step 2.6: Create Components
**File**: `frontend/components/TaskList.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types/api';
import { taskService } from '@/lib/services/task-service';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600">{task.description}</p>
          )}
          <span className={task.completed ? 'text-green-600' : 'text-gray-400'}>
            {task.completed ? 'Completed' : 'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### Step 2.7: Update Root Page
**File**: `frontend/app/page.tsx`
```typescript
import { TaskList } from '@/components/TaskList';

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Bonsai App</h1>
      <TaskList />
    </main>
  );
}
```

---

## 4. Development Workflow

### Backend Development
```bash
# Navigate to backend
cd backend

# Install dependencies
uv sync

# Run development server
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend Development
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Running Both Servers
**Terminal 1 (Backend):**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 5. API Endpoints Contract

### Tasks API
- `GET /tasks` - List all tasks
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get task by ID
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

---

## 6. Cron Job Specifications

### Scheduled Tasks
1. **Daily Cleanup** - Runs at 00:00 (midnight)
   - Purpose: Clean up old data, logs, temporary files

2. **Hourly Sync** - Runs at the start of every hour
   - Purpose: Synchronize data, update cache

### Adding New Cron Jobs
```python
scheduler.add_job(
    your_function,
    CronTrigger(hour=X, minute=Y),
    id="unique_job_id",
    replace_existing=True
)
```

---

## 7. Environment Variables

### Backend (.env)
```
APP_NAME=Bonsai API
DEBUG=true
DATABASE_URL=sqlite:///./bonsai.db
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 8. Deployment Considerations

### Backend Deployment
- Use UV for dependency management
- Set `DEBUG=false` in production
- Configure proper CORS origins
- Use production-grade database (PostgreSQL)
- Set up proper logging

### Frontend Deployment
- Build: `npm run build`
- Update `NEXT_PUBLIC_API_URL` to production API
- Configure environment variables in hosting platform

---

## 9. Testing Strategy

### Backend Tests
```bash
cd backend
uv add --dev pytest pytest-asyncio httpx
uv run pytest
```

### Frontend Tests
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm test
```

---

## 10. Next Steps

1. ✅ Review this specification document
2. ⬜ Initialize backend with UV
3. ⬜ Set up FastAPI with Pydantic models
4. ⬜ Implement cron jobs
5. ⬜ Initialize Next.js 16 frontend
6. ⬜ Create API client and services
7. ⬜ Build UI components
8. ⬜ Test integration between frontend and backend
9. ⬜ Add authentication (if needed)
10. ⬜ Deploy to production

---

## Notes
- This specification provides a foundation; adjust based on specific requirements
- Consider adding database integration (PostgreSQL/SQLite with SQLAlchemy)
- Implement authentication/authorization as needed
- Add error handling and logging
- Set up CI/CD pipeline for automated testing and deployment
