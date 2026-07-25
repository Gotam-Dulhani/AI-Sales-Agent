from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth_router, business_router, chat_router, products_router, orders_router, documents_router, leads_router, analytics_router

app = FastAPI(
    title="AI Sales Agent API",
    description="AI Customer Support & Sales Agent Platform API",
    version="1.0.0"
)

# Configure CORS
origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("Please run init_db.py manually to initialize the database")

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(business_router, prefix="/api/business", tags=["Business"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
app.include_router(documents_router, prefix="/api/documents", tags=["Documents"])
app.include_router(leads_router, prefix="/api/leads", tags=["Leads"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Sales Agent API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
