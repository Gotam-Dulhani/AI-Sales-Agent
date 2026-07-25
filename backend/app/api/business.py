from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.business import Business
from app.schemas.business import BusinessCreate, Business as BusinessSchema, BusinessUpdate
from app.api.deps import get_current_active_user

router = APIRouter()


@router.post("/", response_model=BusinessSchema)
async def create_business(
    business_in: BusinessCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new business for the current user."""
    business = Business(
        **business_in.dict(),
        owner_id=current_user.id
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    
    return business


@router.get("/", response_model=List[BusinessSchema])
async def get_businesses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all businesses for the current user."""
    businesses = db.query(Business).filter(Business.owner_id == current_user.id).all()
    return businesses


@router.get("/{business_id}", response_model=BusinessSchema)
async def get_business(
    business_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific business by ID."""
    business = db.query(Business).filter(
        Business.id == business_id,
        Business.owner_id == current_user.id
    ).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business


@router.put("/{business_id}", response_model=BusinessSchema)
async def update_business(
    business_id: int,
    business_in: BusinessUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a business."""
    business = db.query(Business).filter(
        Business.id == business_id,
        Business.owner_id == current_user.id
    ).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    for field, value in business_in.dict(exclude_unset=True).items():
        setattr(business, field, value)
    
    db.commit()
    db.refresh(business)
    
    return business
