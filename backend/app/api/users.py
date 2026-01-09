# app/api/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.schemas.user import UserResponse, UserUpdate, UserIncomeUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.currency is not None:
        current_user.currency = user_data.currency
    if user_data.timezone is not None:
        current_user.timezone = user_data.timezone
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/income", response_model=UserResponse)
def update_user_income(
    income_data: UserIncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's base income (replaces current income)"""
    current_user.income = income_data.income
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/summary")
def get_user_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's financial summary"""
    # Calculate total expenses
    total_expenses = sum(expense.amount for expense in current_user.expenses)
    
    # Calculate total income entries (additional income beyond base)
    total_income_entries = sum(income.amount for income in current_user.incomes)
    
    return {
        "user_id": current_user.id,
        "name": current_user.name,
        "base_income": current_user.income,
        "total_income_entries": total_income_entries,
        "total_income": current_user.income,
        "total_expenses": total_expenses,
        "balance": current_user.income - total_expenses,
        "expense_count": len(current_user.expenses),
        "income_entry_count": len(current_user.incomes),
        "currency": current_user.currency
    }
