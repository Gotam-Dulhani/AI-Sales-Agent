from app.api.auth import router as auth_router
from app.api.business import router as business_router
from app.api.chat import router as chat_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.documents import router as documents_router
from app.api.leads import router as leads_router
from app.api.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "business_router",
    "chat_router",
    "products_router",
    "orders_router",
    "documents_router",
    "leads_router",
    "analytics_router",
]
