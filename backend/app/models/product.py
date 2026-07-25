from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    compare_price = Column(Float)  # Original price for discounts
    sku = Column(String, unique=True, index=True)
    category = Column(String)
    tags = Column(Text)  # JSON array of tags
    images = Column(Text)  # JSON array of image URLs
    stock_quantity = Column(Integer, default=0)
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.ACTIVE)
    weight = Column(Float)
    dimensions = Column(Text)  # JSON object
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
