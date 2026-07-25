# Railway Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Add Backend Service
1. Go to [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub Repo**
3. Select `AI-Sales-Agent`
4. In the service settings, set **Root Directory** to `backend`
5. Railway auto-detects the Dockerfile and builds

### Step 2: Add PostgreSQL Database
1. In your Railway project, click **New → Database → PostgreSQL**
2. Railway auto-generates `DATABASE_URL`
3. Go to backend service → Variables → Railway will inject `DATABASE_URL` automatically

### Step 3: Add Frontend Service
1. Click **New → GitHub Repo** → same repo `AI-Sales-Agent`
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```

### Step 4: Add Environment Variables to Backend Service
Go to backend service → Variables → Raw Editor → paste:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
QDRANT_URL=http://localhost:6333
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=generate-a-random-32-char-string
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=https://your-frontend.up.railway.app
ENVIRONMENT=production
DEBUG=false
```

### Step 5: Set Start Command
In backend service → Settings → Start Command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Step 6: Generate Database Tables
In backend service → Deployments → click latest → Deploy Logs → open Shell:
```
python init_db.py
```

## Environment Variables Reference

| Variable | Where | Example |
|----------|-------|---------|
| `DATABASE_URL` | Auto-injected by Railway PostgreSQL | `postgresql://...` |
| `GROQ_API_KEY` | Backend | `gsk_...` |
| `GEMINI_API_KEY` | Backend | `AIza...` |
| `JWT_SECRET_KEY` | Backend | Random 64-char hex string |
| `NEXT_PUBLIC_API_URL` | Frontend | `https://backend.up.railway.app` |
| `BACKEND_CORS_ORIGINS` | Backend | `https://frontend.up.railway.app` |

## Notes
- Backend URL: `https://your-service-name.up.railway.app`
- Frontend URL: `https://your-service-name.up.railway.app`
- Free tier: $5/month credit (enough for this project)
- PostgreSQL on Railway free tier: 1GB storage, expires after 90 days
