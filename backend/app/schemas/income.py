from pydantic import BaseModel
from typing import Optional


class IncomeCreate(BaseModel):
    source: str
    amount: float
    date: str  # YYYY-MM-DD format


class IncomeResponse(BaseModel):
    id: int
    user_id: int
    source: str
    amount: float
    date: str  # YYYY-MM-DD format

    class Config:
        from_attributes = True


class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None  # YYYY-MM-DD format