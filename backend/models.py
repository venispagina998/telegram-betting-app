from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    outcomes = Column(String)  # JSON string of possible outcomes
    probabilities = Column(String)  # JSON string of outcome probabilities
    created_by = Column(Integer)  # Telegram user ID of admin
    status = Column(String, default="active")  # active, ended, cancelled

    bets = relationship("Bet", back_populates="event")

class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer)  # Telegram user ID
    outcome = Column(String)
    amount = Column(Float)
    placed_at = Column(DateTime)

    event = relationship("Event", back_populates="bets") 