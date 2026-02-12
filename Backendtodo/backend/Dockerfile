# Dockerfile for FastAPI backend using UV
FROM python:3.11-slim

# Install UV
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./
# Create lock file if missing or just install based on project
RUN uv sync --no-dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Script to ensure /data directory exists for SQLite
CMD ["sh", "-c", "mkdir -p /data && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
