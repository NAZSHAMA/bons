from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.routes import tasks, auth
from app.cron.scheduler import setup_cron_jobs, shutdown_scheduler
from app.database import init_db, close_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting up {settings.app_name}...")

    # Initialize database
    await init_db()

    # Start cron jobs
    if settings.enable_cron_jobs:
        setup_cron_jobs()

    yield

    # Shutdown
    print(f"Shutting down {settings.app_name}...")

    # Shutdown cron jobs
    if settings.enable_cron_jobs:
        shutdown_scheduler()

    # Close database connection
    await close_db()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FastAPI backend with UV, Pydantic, and Cron scheduling",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Bonsai API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "bonsai-api"
    }
