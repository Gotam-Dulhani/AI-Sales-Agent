from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.product import ProductStatus


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    images: Optional[str] = None
    stock_quantity: int = 0
    status: ProductStatus = ProductStatus.ACTIVE
    weight: Optional[float] = None
    dimensions: Optional[str] = None


class ProductCreate(ProductBase):
    business_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    images: Optional[str] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatus] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None


class ProductInDB(ProductBase):
    id: int
    business_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Product(ProductInDB):
    pass
