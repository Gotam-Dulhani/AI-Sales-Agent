from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class ChatStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    HANDED_OVER = "handed_over"


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(SQLEnum(ChatStatus), default=ChatStatus.ACTIVE)
    assigned_agent = Column(String)  # "manager", "sales", "support", "order", "human"
    last_message_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="chats")
    customer = relationship("Customer", back_populates="chats")
    messages = relationship("Message", back_populates="chat")
