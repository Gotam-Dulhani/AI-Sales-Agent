# Setup and Run Guide

## Prerequisites

Before running the project, ensure you have the following installed:

- **Docker** - Download from [docker.com](https://www.docker.com/get-started)
- **Docker Compose** - Usually included with Docker Desktop
- **Python 3.11+** - For local development (optional if using Docker)
- **Node.js 18+** - For local development (optional if using Docker)

## Quick Start (Docker - Recommended)

### 1. Clone or Navigate to Project

```bash
cd ai-sales-agent
```

### 2. Configure Environment Variables

The `.env` file is already configured with your API keys. Verify the following:

```bash
# Check your .env file
cat .env
```

Ensure these are set correctly:
- `MISTRAL_API_KEY` - Your Mistral AI API key (already set)
- `JWT_SECRET_KEY` - A secure secret key (already set)
- `POSTGRES_PASSWORD` - Database password (already set)

### 3. Start All Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Qdrant Vector Database (port 6333)
- Redis (port 6379)
- FastAPI Backend (port 8000)
- Next.js Frontend (port 3000)
- Nginx Reverse Proxy (port 80)

### 4. Check Service Status

```bash
docker-compose ps
```

All services should show as "Up" or "healthy".

### 5. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Nginx (Reverse Proxy):** http://localhost

### 7. Stop Services

```bash
docker-compose down
```

### 8. Stop and Remove All Data

```bash
docker-compose down -v
```

⚠️ **Warning:** This will delete all database data and uploaded files.

## Local Development Setup

If you prefer to run services locally without Docker:

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL, Qdrant, and Redis (or use Docker for these)
# You can start just the databases with Docker:
docker-compose up postgres qdrant redis -d

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Database Initialization

The application uses SQLAlchemy models. You need to create the database tables:

### Using Docker

```bash
# Access the backend container
docker-compose exec backend bash

# Run database initialization
python -c "from app.db.session import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database tables created successfully')"
```

### Using Local Development

```bash
cd backend
python -c "from app.db.session import engine; from app.models import Base; Base.metadata.create_all(bind=engine); print('Database tables created successfully')"
```

## Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "qdrant": "connected"
}
```

### 2. Test API Documentation

Visit http://localhost:8000/docs in your browser to see the interactive API documentation.

### 3. Test Frontend

Visit http://localhost:3000 in your browser to see the landing page.

### 4. Test User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "phone": "+923001234567"
  }'
```

### 5. Test AI Service

```bash
# Access backend container
docker-compose exec backend bash

# Test Mistral AI
python -c "
from app.services.ai_service import ai_service
import asyncio

async def test():
    response = await ai_service.generate_response('Hello, how are you?')
    print(response)

asyncio.run(test())
"
```

## Troubleshooting

### Issue: Docker containers won't start

**Solution:**
```bash
# Check Docker is running
docker --version
docker-compose --version

# Check for port conflicts
netstat -ano | findstr "5432"
netstat -ano | findstr "6333"
netstat -ano | findstr "8000"
netstat -ano | findstr "3000"

# Kill processes using ports if needed
# Or change ports in docker-compose.yml
```

### Issue: Backend fails to connect to database

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify DATABASE_URL in .env matches docker-compose.yml
```

### Issue: AI API errors

**Solution:**
```bash
# Verify API keys are set
docker-compose exec backend env | grep MISTRAL

# Test API key manually
curl -X POST https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral-tiny","messages":[{"role":"user","content":"test"}]}'
```

### Issue: Frontend build errors

**Solution:**
```bash
# Rebuild frontend container
docker-compose build --no-cache frontend

# Or run locally to see detailed errors
cd frontend
npm install
npm run dev
```

### Issue: Qdrant connection errors

**Solution:**
```bash
# Check Qdrant is running
curl http://localhost:6333/health

# Check Qdrant logs
docker-compose logs qdrant

# Reset Qdrant data
docker-compose down -v
docker-compose up -d
```

### Issue: Permission errors on uploads

**Solution:**
```bash
# Create uploads directory with proper permissions
mkdir -p backend/uploads
chmod 777 backend/uploads
```

## Development Workflow

### 1. Make Code Changes

Edit files in `backend/` or `frontend/` directories.

### 2. Backend Auto-Reload

The backend runs with `--reload` flag, so changes are automatically picked up.

### 3. Frontend Auto-Reload

The frontend runs with `npm run dev`, so changes are automatically picked up.

### 4. View Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Production Deployment

For production deployment, you should:

1. **Change all default passwords and secrets**
2. **Use environment-specific `.env` files**
3. **Enable SSL/HTTPS**
4. **Set up proper logging and monitoring**
5. **Configure backup strategies**
6. **Use a production-grade database**
7. **Implement rate limiting and security measures**
8. **Set up CI/CD pipeline**

## Useful Commands

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Run one-off command
docker-compose exec backend python -c "print('test')"

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a

# View container logs
docker logs ai_sales_agent_backend
docker logs ai_sales_agent_frontend
```

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all services are running: `docker-compose ps`
4. Check port availability
5. Review the documentation in `docs/` folder

## Next Steps

After successful setup:

1. **Register a user account** at http://localhost:3000/register
2. **Create a business** in the dashboard
3. **Upload documents** (PDFs, FAQs) for the AI knowledge base
4. **Add products** to your catalog
5. **Test the chat interface** with AI responses
6. **Explore the API documentation** at http://localhost:8000/docs
