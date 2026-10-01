from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # Ensure all models are registered

# Create database tables if not existing (useful for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Customer Ordering & Authentication API for Gulavlival Grand",
)

# CORS setup for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api/v1
from app.modules.auth.router import router as auth_router
from app.modules.menu.router import router as menu_router
from app.modules.orders.router import router as orders_router
from app.modules.addresses.router import router as addresses_router

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(menu_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(addresses_router, prefix=settings.API_V1_PREFIX)



@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Gulavlival Grand Backend API",
        "version": settings.VERSION,
    }
