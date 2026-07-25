from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CONVERTED = "converted"
    LOST = "lost"


class LeadSource(str, enum.Enum):
    WHATSAPP = "whatsapp"
    WEBSITE = "website"
    REFERRAL = "referral"
    OTHER = "other"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(SQLEnum(LeadStatus), default=LeadStatus.NEW)
    source = Column(SQLEnum(LeadSource), default=LeadSource.WHATSAPP)
    score = Column(Float, default=0)  # Lead qualification score (0-100)
    interest_level = Column(String)  # "high", "medium", "low"
    budget = Column(String)
    timeline = Column(String)
    notes = Column(Text)
    assigned_to = Column(Integer, ForeignKey("users.id"))  # Business owner or staff
    follow_up_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    business = relationship("Business", back_populates="leads")
    customer = relationship("Customer", back_populates="leads")
