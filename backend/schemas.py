from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional

class EventBase(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    outcomes: str  # JSON string of possible outcomes
    probabilities: Dict[str, float]  # JSON-like dictionary of outcome probabilities

class EventCreate(EventBase):
    created_by: int

class Event(EventBase):
    id: int
    created_by: int
    status: str

    class Config:
        from_attributes = True

class BetBase(BaseModel):
    event_id: int
    outcome: str
    amount: float

class BetCreate(BetBase):
    user_id: int

class Bet(BetBase):
    id: int
    user_id: int
    placed_at: datetime

    class Config:
        from_attributes = True

class EventResult(BaseModel):
    event_id: int
    total_bets: int
    outcome_counts: Dict[str, int] 