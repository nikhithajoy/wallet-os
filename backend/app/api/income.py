# app/api/income.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import User, Income
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("", response_model=List[IncomeResponse])
def get_incomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all income entries for the current user"""
    incomes = db.query(Income).filter(Income.user_id == current_user.id).all()
    return incomes


@router.post("", response_model=IncomeResponse)
def add_income(
    income_data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new income entry"""
    # Create income record
    income = Income(
        user_id=current_user.id,
        source=income_data.source,
        amount=income_data.amount,
        date=income_data.date
    )
    db.add(income)
    
    # Also update user's total income
    current_user.income = (current_user.income or 0) + income_data.amount
    
    db.commit()
    db.refresh(income)
    
    return income


@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific income entry by ID"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income entry not found"
        )
    
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    income_data: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an income entry"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income entry not found"
        )
    
    # Calculate difference for updating user's total income
    old_amount = income.amount
    
    # Update fields
    if income_data.source is not None:
        income.source = income_data.source
    if income_data.amount is not None:
        income.amount = income_data.amount
        # Update user's total income with the difference
        current_user.income = (current_user.income or 0) - old_amount + income_data.amount
    if income_data.date is not None:
        income.date = income_data.date
    
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an income entry"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income entry not found"
        )
    
    # Subtract from user's total income
    current_user.income = (current_user.income or 0) - income.amount
    
    db.delete(income)
    db.commit()
    
    return {"message": "Income entry deleted successfully"}