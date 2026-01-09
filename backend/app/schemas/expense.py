# app/schemas/expense.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class ExpenseCreate(BaseModel):
    item: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    date: str  # YYYY-MM-DD format


class ExpenseUpdate(BaseModel):
    item: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    item: str
    amount: float
    category: str
    date: str
    user_id: int

    class Config:
        from_attributes = True
