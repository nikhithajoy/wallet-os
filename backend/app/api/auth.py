# app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.db.models import User, Expense
from app.schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        income=user_data.income,
        currency=user_data.currency,
        timezone=user_data.timezone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate token
    token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            income=user.income,
            currency=user.currency,
            timezone=user.timezone
        ),
        expenses=[]
    )


@router.post("/login", response_model=AuthResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password"""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Get user's expenses
    expenses = db.query(Expense).filter(Expense.user_id == user.id).all()
    expenses_list = [
        {
            "id": exp.id,
            "item": exp.item,
            "amount": exp.amount,
            "category": exp.category,
            "date": exp.date
        }
        for exp in expenses
    ]
    
    # Generate token
    token = create_access_token(data={"sub": user.id})
    
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            income=user.income,
            currency=user.currency,
            timezone=user.timezone
        ),
        expenses=expenses_list
    )
