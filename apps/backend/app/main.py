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

# CORS setup for Next.js frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api/v1
from fastapi import WebSocket, WebSocketDisconnect
from app.core.websocket import order_ws_manager, menu_ws_manager
from app.modules.auth.router import router as auth_router
from app.modules.menu.router import router as menu_router
from app.modules.orders.router import router as orders_router
from app.modules.addresses.router import router as addresses_router
from app.modules.staff_auth.router import router as staff_auth_router
from app.modules.staff_orders.router import router as staff_orders_router
from app.modules.staff_menu.router import router as staff_menu_router
from app.modules.settings.router import router as settings_router
from app.modules.team.router import router as team_router
from app.modules.cash.router import router as cash_router
from app.modules.reviews.router import router as reviews_router

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(menu_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(addresses_router, prefix=settings.API_V1_PREFIX)
app.include_router(staff_auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(staff_orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(staff_menu_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(team_router, prefix=settings.API_V1_PREFIX)
app.include_router(cash_router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews_router, prefix=settings.API_V1_PREFIX)


@app.websocket("/api/v1/ws/orders")
async def websocket_orders(websocket: WebSocket):
    await order_ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        order_ws_manager.disconnect(websocket)


@app.websocket("/api/v1/ws/menu")
async def websocket_menu(websocket: WebSocket):
    await menu_ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        menu_ws_manager.disconnect(websocket)




@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Gulavlival Grand Backend API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "status": "online",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Gulavlival Grand Backend API",
        "version": settings.VERSION,
    }

