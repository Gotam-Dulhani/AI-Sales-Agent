from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    email = Column(String)
    whatsapp_number = Column(String, unique=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    notes = Column(Text)
    total_orders = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="customers")
    chats = relationship("Chat", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    leads = relationship("Lead", back_populates="customer")
