from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from app.db.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.api.deps import get_current_active_user

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return token."""
    # Normalize email to lowercase
    normalized_email = user_in.email.lower().strip()

    # Check if user already exists (case-insensitive)
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please login instead."
        )
    
    # Create new user with normalized email
    user = User(
        email=normalized_email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        is_business_owner=user_in.is_business_owner
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user and return access token."""
    # Normalize email to lowercase for case-insensitive login
    normalized_email = login_data.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user
