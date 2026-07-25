from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    industry = Column(String)
    website = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="businesses")
    customers = relationship("Customer", back_populates="business")
    products = relationship("Product", back_populates="business")
    orders = relationship("Order", back_populates="business")
    documents = relationship("Document", back_populates="business")
    chats = relationship("Chat", back_populates="business")
    leads = relationship("Lead", back_populates="business")
