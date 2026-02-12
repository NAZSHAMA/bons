# Database Documentation

## Overview

The Bonsai API uses **SQLAlchemy 2.0** with **async support** for database operations. The database backend is **SQLite** with **aiosqlite** for asynchronous operations.

## Technology Stack

- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: SQLite
- **Async Driver**: aiosqlite
- **Migrations**: Alembic (optional, for advanced use)

## Database Configuration

### Connection String

The database connection is configured in `.env`:

```env
DATABASE_URL=sqlite+aiosqlite:///./bonsai.db
```

**Format**: `sqlite+aiosqlite:///<path_to_database>`

### Supported Databases

While SQLite is used by default, SQLAlchemy supports many databases:

| Database | Driver | Connection String Example |
|----------|--------|---------------------------|
| SQLite | aiosqlite | `sqlite+aiosqlite:///./app.db` |
| PostgreSQL | asyncpg | `postgresql+asyncpg://user:pass@localhost/db` |
| MySQL | aiomysql | `mysql+aiomysql://user:pass@localhost/db` |

## Database Models

### Task Model

Located in: `app/models/database.py`

```python
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
```

**Fields:**
- `id`: Auto-incrementing primary key
- `title`: Task title (max 200 characters, required)
- `description`: Optional task description
- `completed`: Boolean flag for completion status
- `created_at`: Timestamp of creation (auto-set)
- `updated_at`: Timestamp of last update (auto-updated)

### User Model (Future Use)

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
```

## Database Session Management

### Async Session Factory

Located in: `app/database.py`

```python
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
```

### Dependency Injection

All routes use FastAPI's dependency injection to get database sessions:

```python
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

**Usage in routes:**
```python
@router.get("/tasks/")
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task))
    return result.scalars().all()
```

## Database Operations

### CRUD Operations

#### Create
```python
db_task = Task(title="New Task", description="Task details")
db.add(db_task)
await db.flush()
await db.refresh(db_task)
```

#### Read
```python
# Get all
result = await db.execute(select(Task))
tasks = result.scalars().all()

# Get by ID
result = await db.execute(select(Task).where(Task.id == task_id))
task = result.scalar_one_or_none()

# Filter
query = select(Task).where(Task.completed == True)
result = await db.execute(query)
```

#### Update
```python
result = await db.execute(select(Task).where(Task.id == task_id))
task = result.scalar_one_or_none()
task.title = "Updated Title"
await db.flush()
await db.refresh(task)
```

#### Delete
```python
result = await db.execute(select(Task).where(Task.id == task_id))
task = result.scalar_one_or_none()
await db.delete(task)
```

## Database Initialization

### Automatic Initialization

The database is automatically initialized on application startup:

**File**: `app/main.py`
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()  # Creates all tables
    yield
    # Shutdown
    await close_db()  # Closes connections
```

### Manual Initialization

If needed, you can manually initialize:

```python
from app.database import init_db
import asyncio

async def main():
    await init_db()

asyncio.run(main())
```

## Querying Best Practices

### Use Select Instead of Query

SQLAlchemy 2.0 uses `select()` instead of the legacy `.query()`:

**Good (SQLAlchemy 2.0):**
```python
result = await db.execute(select(Task).where(Task.completed == True))
tasks = result.scalars().all()
```

**Bad (Legacy):**
```python
# Don't use this
tasks = db.query(Task).filter(Task.completed == True).all()
```

### Ordering Results

```python
query = select(Task).order_by(Task.created_at.desc())
result = await db.execute(query)
```

### Filtering

```python
# Single condition
query = select(Task).where(Task.completed == True)

# Multiple conditions (AND)
query = select(Task).where(
    Task.completed == True,
    Task.created_at > some_date
)

# OR conditions
from sqlalchemy import or_
query = select(Task).where(
    or_(Task.completed == True, Task.title.like("%urgent%"))
)
```

### Pagination

```python
query = select(Task).limit(10).offset(20)
result = await db.execute(query)
```

## Migration with Alembic

### Initialize Alembic

```bash
cd backend
uv run alembic init migrations
```

### Configure Alembic

Edit `alembic.ini`:
```ini
sqlalchemy.url = sqlite+aiosqlite:///./bonsai.db
```

Edit `migrations/env.py`:
```python
from app.models.database import Base
target_metadata = Base.metadata
```

### Create Migration

```bash
uv run alembic revision --autogenerate -m "Add new column"
```

### Run Migration

```bash
uv run alembic upgrade head
```

### Rollback Migration

```bash
uv run alembic downgrade -1
```

## Database File Location

**Default**: `./bonsai.db` (in the backend directory)

To view the database:
```bash
# Install sqlite3 command-line tool
sqlite3 bonsai.db

# View tables
.tables

# View schema
.schema tasks

# Query data
SELECT * FROM tasks;

# Exit
.quit
```

## Switching to PostgreSQL

For production, PostgreSQL is recommended:

1. **Install Dependencies:**
```bash
uv add asyncpg psycopg2-binary
```

2. **Update Configuration:**
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/bonsai
```

3. **No Code Changes Required!**
   - SQLAlchemy handles the differences
   - All queries work the same way

## Performance Tips

### Connection Pooling

For production, configure connection pooling:

```python
engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)
```

### Indexes

Add indexes for frequently queried fields:

```python
class Task(Base):
    # ...
    created_at = Column(DateTime, index=True)
    completed = Column(Boolean, index=True)
```

### Batch Operations

For bulk inserts:

```python
tasks = [
    Task(title=f"Task {i}", completed=False)
    for i in range(100)
]
db.add_all(tasks)
await db.flush()
```

## Troubleshooting

### Database Locked Error

SQLite can get locked with concurrent writes. Solutions:
1. Use PostgreSQL for production
2. Reduce concurrent write operations
3. Enable WAL mode in SQLite

### Migration Conflicts

If Alembic migrations conflict:
```bash
# View current version
uv run alembic current

# View history
uv run alembic history

# Stamp database to specific version
uv run alembic stamp head
```

### Reset Database

To start fresh:
```bash
# Delete database file
rm bonsai.db

# Restart server (will recreate tables)
uv run uvicorn app.main:app --reload
```

## Security Considerations

1. **Never commit database files** (`.db` files)
   - Already in `.gitignore`

2. **Use environment variables** for connection strings
   - Never hardcode credentials

3. **SQL Injection Prevention**
   - SQLAlchemy automatically parameterizes queries
   - Always use ORM methods, not raw SQL

4. **Password Hashing**
   - Use bcrypt or argon2 for password hashing
   - Never store plain text passwords

## Monitoring

### Log SQL Queries

Set `debug=True` in config to see SQL queries:

```env
DEBUG=true
```

This will log all SQL statements to console.

### Query Performance

Use SQLAlchemy's query profiling:

```python
from sqlalchemy import event

@event.listens_for(engine.sync_engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, params, context, executemany):
    print(f"SQL: {statement}")
```

## Resources

- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [FastAPI Database Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [aiosqlite Docs](https://aiosqlite.omnilib.dev/)
