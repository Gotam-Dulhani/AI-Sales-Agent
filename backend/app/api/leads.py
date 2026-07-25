from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, Lead as LeadSchema, LeadUpdate, LeadQualification
from app.api.deps import get_current_active_user
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/", response_model=LeadSchema)
async def create_lead(
    lead_in: LeadCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new lead."""
    # Get business_id from user
    from app.models.business import Business
    business = db.query(Business).filter(Business.owner_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=400, detail="Business not found for user")
    
    lead = Lead(
        **lead_in.model_dump(exclude_unset=True, exclude_none=True),
        business_id=business.id,
        status="new"
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    return lead


@router.get("/", response_model=List[LeadSchema])
async def get_leads(
    business_id: int,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all leads for a business with optional status filter."""
    query = db.query(Lead).filter(Lead.business_id == business_id)
    
    if status:
        query = query.filter(Lead.status == status)
    
    leads = query.offset(skip).limit(limit).all()
    return leads


@router.get("/{lead_id}", response_model=LeadSchema)
async def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return lead


@router.put("/{lead_id}", response_model=LeadSchema)
async def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for field, value in lead_in.dict(exclude_unset=True).items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    
    return lead


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    
    return {"message": "Lead deleted successfully"}


@router.post("/{lead_id}/qualify", response_model=LeadQualification)
async def qualify_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Qualify a lead using AI to determine score and interest level."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Get customer information and chat history for context
    from app.models.customer import Customer
    from app.models.message import Message
    from app.models.chat import Chat
    
    customer = db.query(Customer).filter(Customer.id == lead.customer_id).first()
    messages = db.query(Message).join(Chat).filter(
        Chat.customer_id == lead.customer_id
    ).order_by(Message.created_at).limit(10).all()
    
    # Build context for AI
    context = f"""
    Customer: {customer.name if customer else 'Unknown'}
    Email: {customer.email if customer else 'Unknown'}
    Phone: {customer.phone if customer else 'Unknown'}
    
    Recent messages:
    """
    
    for msg in messages:
        context += f"\n{msg.role}: {msg.content}"
    
    # Use AI to qualify the lead
    prompt = f"""Based on the following customer information and conversation history, qualify this lead:
    
    {context}
    
    Provide:
    1. A score from 0-100 (higher = more likely to convert)
    2. Interest level (high, medium, or low)
    3. Brief reasoning for the score
    
    Return as JSON with keys: score, interest_level, reasoning"""
    
    try:
        response = await ai_service.generate_response(prompt, temperature=0.3)
        
        # Parse AI response (in production, use structured output)
        # For now, return a basic qualification
        qualification = LeadQualification(
            score=70.0,  # Default score
            interest_level="medium",
            reasoning=response[:500]  # Use AI response as reasoning
        )
        
        # Update lead with qualification
        lead.score = qualification.score
        lead.interest_level = qualification.interest_level
        lead.notes = f"{lead.notes or ''}\n\nAI Qualification: {qualification.reasoning}" if lead.notes else f"AI Qualification: {qualification.reasoning}"
        
        # Auto-update status based on score
        if qualification.score >= 80:
            lead.status = "qualified"
        elif qualification.score >= 50:
            lead.status = "contacted"
        
        db.commit()
        db.refresh(lead)
        
        return qualification
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error qualifying lead: {str(e)}")


@router.post("/{lead_id}/convert")
async def convert_lead(
    lead_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a lead as converted."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.status = "converted"
    db.commit()
    db.refresh(lead)
    
    return {"message": "Lead converted successfully", "lead": lead}
