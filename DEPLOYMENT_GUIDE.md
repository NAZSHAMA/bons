# Deployment Guide - Bonsai Task Manager

## Production Deployment Checklist

### Backend Deployment

#### 1. Environment Configuration

Update `backend/.env` for production:

```env
# Application
APP_NAME=Bonsai API
DEBUG=false
API_PREFIX=/api/v1

# CORS (Update with your frontend URL)
CORS_ORIGINS=["https://yourdomain.com"]

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/bonsai_prod

# Security (Generate new secret!)
SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Email Configuration
MAIL_ENABLED=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email Verification
EMAIL_VERIFICATION_REQUIRED=true
```

#### 2. Generate Secure Secret Key

```bash
openssl rand -hex 32
```

Copy the output to `SECRET_KEY` in your .env file.

#### 3. Setup PostgreSQL Database

```bash
# Install PostgreSQL
# Create database
createdb bonsai_prod

# Install asyncpg
cd backend
uv add asyncpg
```

Update DATABASE_URL:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/bonsai_prod
```

#### 4. Setup Email Service

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in MAIL_PASSWORD

**For SendGrid/Mailgun:**
Update MAIL_SERVER and credentials accordingly.

#### 5. Install Dependencies

```bash
cd backend
uv sync
```

#### 6. Run with Production Server

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**With Gunicorn (recommended):**
```bash
uv add gunicorn
uv run gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### 7. Setup Systemd Service (Linux)

Create `/etc/systemd/system/bonsai-api.service`:

```ini
[Unit]
Description=Bonsai FastAPI Application
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/bonsai/backend
Environment="PATH=/var/www/bonsai/backend/.venv/bin"
ExecStart=/var/www/bonsai/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable bonsai-api
sudo systemctl start bonsai-api
sudo systemctl status bonsai-api
```

#### 8. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/bonsai-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bonsai-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 9. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Push to GitHub**
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/bonsai-frontend.git
git push -u origin main
```

2. **Deploy to Vercel**
- Visit https://vercel.com
- Import GitHub repository
- Set environment variable:
  ```
  NEXT_PUBLIC_API_URL=https://api.yourdomain.com
  ```
- Deploy

#### Option 2: Self-Hosted with PM2

1. **Build Application**
```bash
cd frontend
npm run build
```

2. **Install PM2**
```bash
npm install -g pm2
```

3. **Start with PM2**
```bash
pm2 start npm --name "bonsai-frontend" -- start
pm2 save
pm2 startup
```

4. **Setup Nginx**

Create `/etc/nginx/sites-available/bonsai-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d yourdomain.com
```

#### Option 3: Docker

**Create docker-compose.yml** in project root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/bonsai
      - SECRET_KEY=${SECRET_KEY}
      - MAIL_ENABLED=true
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=bonsai
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy files
COPY . .

# Install dependencies
RUN uv sync

# Expose port
EXPOSE 8000

# Run
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Run
CMD ["npm", "start"]
```

**Deploy:**
```bash
docker-compose up -d
```

---

## Database Migration

### From SQLite to PostgreSQL

1. **Backup SQLite Data**
```bash
sqlite3 backend/bonsai.db .dump > backup.sql
```

2. **Install PostgreSQL Dependencies**
```bash
cd backend
uv add asyncpg psycopg2-binary
```

3. **Update DATABASE_URL**
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/bonsai
```

4. **Restart Application**
- Tables will be created automatically
- Or use Alembic for migrations

5. **Import Data (if needed)**
```bash
# Convert SQLite dump to PostgreSQL format
# Use tools like pgloader or manual conversion
```

---

## Email Service Configuration

### Gmail

1. Enable 2FA
2. Generate App Password
3. Update .env:
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_STARTTLS=true
```

### SendGrid

```env
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
```

### Amazon SES

```env
MAIL_SERVER=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
```

---

## Security Hardening

### 1. Environment Variables

Never commit:
- .env files
- Secret keys
- Database credentials
- Email passwords

Use:
- Environment variable managers
- Secret management services (AWS Secrets Manager, etc.)

### 2. Database Security

```python
# Use connection pooling
engine = create_async_engine(
    database_url,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

### 3. Rate Limiting

Install slowapi:
```bash
uv add slowapi
```

Add to main.py:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### 4. HTTPS Only

Force HTTPS redirects in Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Security Headers

Add middleware:
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["yourdomain.com", "www.yourdomain.com"]
)
```

---

## Monitoring & Logging

### 1. Application Logs

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 2. Error Tracking

Install Sentry:
```bash
uv add sentry-sdk
```

Configure:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### 3. Performance Monitoring

```python
import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {process_time:.2f}s")
    return response
```

---

## Backup Strategy

### 1. Database Backups

**Automated PostgreSQL backup:**
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/bonsai"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump bonsai_prod > "$BACKUP_DIR/bonsai_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "bonsai_*.sql" -mtime +7 -delete
```

**Cron job:**
```bash
0 2 * * * /path/to/backup.sh
```

### 2. File Backups

Backup important files:
- Environment files (.env templates)
- Uploaded files (if any)
- Configuration files

---

## Performance Optimization

### Backend

1. **Connection Pooling**
```python
pool_size=20
max_overflow=10
```

2. **Caching** (Redis)
```bash
uv add redis aioredis
```

3. **Database Indexing**
Already implemented on:
- user.email
- user.username
- task.user_id

### Frontend

1. **Image Optimization**
Use Next.js Image component

2. **Code Splitting**
Already automatic with Next.js App Router

3. **Caching**
```typescript
export const revalidate = 3600; // Cache for 1 hour
```

---

## Health Checks

### Backend Health Endpoint

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": await check_db_connection(),
        "version": settings.app_version
    }
```

### Database Health Check

```python
async def check_db_connection():
    try:
        await db.execute(select(1))
        return "connected"
    except Exception:
        return "disconnected"
```

---

## CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Backend
        run: |
          cd backend
          pip install uv
          uv sync
          uv run pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Your deployment script
```

---

## Scaling Considerations

### Horizontal Scaling

**Backend:**
- Run multiple uvicorn workers
- Use load balancer (Nginx, HAProxy)
- Stateless design (JWT) enables easy scaling

**Frontend:**
- Deploy to CDN (Vercel, Cloudflare)
- Edge caching
- Static asset optimization

### Database Scaling

**Read Replicas:**
```python
# Primary for writes
write_engine = create_async_engine(primary_url)

# Replica for reads
read_engine = create_async_engine(replica_url)
```

**Connection Pooling:**
```python
pool_size=50  # Adjust based on load
max_overflow=20
```

---

## Cost Optimization

### Free Tier Options

**Backend:**
- Railway.app (Free tier available)
- Render.com (Free tier)
- Fly.io (Free allowance)

**Frontend:**
- Vercel (Generous free tier)
- Netlify (Free tier)
- Cloudflare Pages (Free)

**Database:**
- Supabase (Free PostgreSQL)
- PlanetScale (Free MySQL)
- Neon (Free PostgreSQL)

**Email:**
- SendGrid (100 emails/day free)
- Mailgun (100 emails/day free)

### Estimated Costs (Mid-Scale)

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Backend | Railway | $5-20 |
| Frontend | Vercel | Free-$20 |
| Database | Supabase | Free-$25 |
| Email | SendGrid | Free-$15 |
| **Total** | | **$5-80/month** |

---

## Monitoring Services

### Application Performance

- **Sentry** - Error tracking
- **DataDog** - Full monitoring
- **New Relic** - APM
- **LogRocket** - Frontend monitoring

### Uptime Monitoring

- **UptimeRobot** (Free)
- **Pingdom**
- **StatusCake**

---

## SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
sudo certbot --nginx -d api.yourdomain.com -d yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

### Cloudflare (Free)

- Add domain to Cloudflare
- Enable SSL/TLS
- Full (strict) mode recommended

---

## Domain Configuration

### DNS Records

```
A     @              → Your-Server-IP
A     api            → Your-Server-IP
CNAME www            → yourdomain.com
```

### CORS Configuration

Update backend .env:
```env
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

---

## Testing Before Production

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API
ab -n 1000 -c 10 http://localhost:8000/health
```

### Security Audit

```bash
# Install safety
uv add --dev safety

# Check dependencies
uv run safety check
```

---

## Rollback Strategy

### Database Migrations

```bash
# Rollback one migration
uv run alembic downgrade -1

# Rollback to specific version
uv run alembic downgrade <revision>
```

### Application Rollback

Keep previous versions:
```bash
/var/www/bonsai-v1/
/var/www/bonsai-v2/
/var/www/bonsai-current/ → symlink
```

Switch versions:
```bash
ln -sfn /var/www/bonsai-v1 /var/www/bonsai-current
sudo systemctl restart bonsai-api
```

---

## Summary

✅ **Production-ready deployment guide**
✅ **Multiple hosting options**
✅ **Security hardening steps**
✅ **Monitoring and backup strategies**
✅ **Cost optimization tips**
✅ **Scaling considerations**

Choose your deployment method and follow the corresponding sections!
