from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import SessionLocal, engine
from datetime import datetime
# from auth import verify_telegram_data

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Betting App API",
    description="API для приложения виртуальных ставок",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Временная функция для тестирования
def get_test_user():
    return {
        'user_id': 1,
        'first_name': 'Test',
        'last_name': 'User',
        'username': 'testuser',
        'is_admin': True
    }

@app.get("/")
async def root():
    return {
        "message": "Добро пожаловать в API приложения виртуальных ставок",
        "endpoints": {
            "events": {
                "list": "/events/",
                "create": "/events/",
                "get": "/events/{event_id}",
                "results": "/events/{event_id}/results"
            },
            "bets": {
                "create": "/bets/",
                "user_bets": "/bets/{user_id}",
                "event_user_bets": "/events/{event_id}/user-bets/{user_id}"
            }
        }
    }

@app.post("/events/", response_model=schemas.Event)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    # Проверяем, является ли пользователь администратором
    if not user_data.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Проверяем, что сумма вероятностей равна 100
    if sum(event.probabilities.values()) != 100:
        raise HTTPException(status_code=400, detail="Probabilities must sum to 100")

    db_event = models.Event(
        title=event.title,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        outcomes=event.outcomes,
        probabilities=event.probabilities,
        created_by=user_data['user_id']
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/", response_model=List[schemas.Event])
def read_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    events = db.query(models.Event).offset(skip).limit(limit).all()
    return events

@app.post("/bets/", response_model=schemas.Bet)
def create_bet(
    bet: schemas.BetCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    # Проверяем, что пользователь делает ставку от своего имени
    if bet.user_id != user_data['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if event exists and is still open
    event = db.query(models.Event).filter(models.Event.id == bet.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.end_time < datetime.now():
        raise HTTPException(status_code=400, detail="Event has ended")
    
    db_bet = models.Bet(**bet.dict())
    db.add(db_bet)
    db.commit()
    db.refresh(db_bet)
    return db_bet

@app.get("/bets/{user_id}", response_model=List[schemas.Bet])
def read_user_bets(
    user_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    # Проверяем, что пользователь запрашивает свои ставки
    if user_id != user_data['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    bets = db.query(models.Bet).filter(models.Bet.user_id == user_id).all()
    return bets

@app.get("/events/{event_id}/results", response_model=schemas.EventResult)
def get_event_results(
    event_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    bets = db.query(models.Bet).filter(models.Bet.event_id == event_id).all()
    total_bets = len(bets)
    if total_bets == 0:
        return {"event_id": event_id, "total_bets": 0, "outcome_counts": {}}
    
    outcome_counts = {}
    for bet in bets:
        outcome_counts[bet.outcome] = outcome_counts.get(bet.outcome, 0) + 1
    
    return {
        "event_id": event_id,
        "total_bets": total_bets,
        "outcome_counts": outcome_counts
    }

@app.get("/events/{event_id}", response_model=schemas.Event)
def read_event(
    event_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.get("/events/{event_id}/user-bets/{user_id}", response_model=List[schemas.Bet])
def read_user_bets_for_event(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_test_user)
):
    # Проверяем, что пользователь запрашивает свои ставки
    if user_id != user_data['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    bets = db.query(models.Bet).filter(
        models.Bet.event_id == event_id,
        models.Bet.user_id == user_id
    ).all()
    return bets 