# Bonsai API - Backend

FastAPI backend with UV package management, Pydantic validation, and APScheduler for cron jobs.

## Setup

### Prerequisites
- Python 3.11 or higher
- UV package manager

### Installation

1. Install dependencies with UV:
```bash
cd backend
uv sync
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

### Development Server
```bash
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs (Swagger): http://localhost:8000/docs
- Alternative Docs (ReDoc): http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── models/              # Pydantic models
│   │   ├── __init__.py
│   │   └── schemas.py       # Request/Response models
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── services/            # Business logic
│   │   └── __init__.py
│   ├── cron/                # Scheduled jobs
│   │   ├── __init__.py
│   │   └── scheduler.py     # Cron job definitions
│   └── utils/               # Helper functions
│       └── __init__.py
├── tests/                   # Test files
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── pyproject.toml          # UV project config
└── README.md               # This file
```

## API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check

### Tasks API
- `GET /tasks` - List all tasks (optional query param: `?completed=true/false`)
- `POST /tasks` - Create a new task
- `GET /tasks/{id}` - Get a specific task
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task
- `POST /tasks/{id}/toggle` - Toggle task completion status

## Cron Jobs

The application includes scheduled tasks managed by APScheduler:

1. **Daily Cleanup** - Runs at midnight (00:00)
   - Cleans up old data and temporary files

2. **Hourly Sync** - Runs at the start of every hour
   - Synchronizes data and updates cache

3. **Test Task** - Runs every minute (for testing, remove in production)

To disable cron jobs, set `ENABLE_CRON_JOBS=false` in `.env`

## Environment Variables

See `.env.example` for all available configuration options:

- `APP_NAME` - Application name
- `DEBUG` - Debug mode (true/false)
- `CORS_ORIGINS` - Allowed CORS origins
- `DATABASE_URL` - Database connection string
- `ENABLE_CRON_JOBS` - Enable/disable scheduled tasks

## Development

### Adding New Endpoints

1. Create a new router in `app/routes/`
2. Define Pydantic models in `app/models/schemas.py`
3. Include the router in `app/main.py`

### Adding New Cron Jobs

Add new scheduled tasks in `app/cron/scheduler.py`:

```python
scheduler.add_job(
    your_function,
    CronTrigger(hour=X, minute=Y),
    id="unique_job_id",
    replace_existing=True
)
```

## Testing

```bash
# Install test dependencies
uv add --dev pytest pytest-asyncio httpx

# Run tests
uv run pytest
```

## Production Deployment

1. Set `DEBUG=false` in environment
2. Use a production ASGI server (uvicorn with workers)
3. Set proper CORS origins
4. Use a production database (PostgreSQL recommended)
5. Set strong secret keys

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
