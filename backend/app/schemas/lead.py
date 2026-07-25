from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.lead import LeadStatus, LeadSource


class LeadBase(BaseModel):
    status: Optional[LeadStatus] = None
    source: Optional[LeadSource] = None
    score: Optional[float] = None
    interest_level: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[int] = None
    follow_up_date: Optional[datetime] = None


class LeadCreate(LeadBase):
    customer_id: int


class LeadUpdate(LeadBase):
    pass


class LeadInDB(LeadBase):
    id: int
    business_id: int
    customer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Lead(LeadInDB):
    pass


class LeadQualification(BaseModel):
    score: float
    interest_level: str
    reasoning: str
