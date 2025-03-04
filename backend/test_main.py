from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest
from datetime import datetime, timedelta
import json
from main import app
import models
from database import Base

# Создаем тестовую базу данных в памяти
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем тестовые данные
def create_test_event():
    return {
        "title": "Тестовое событие",
        "description": "Описание тестового события",
        "start_time": datetime.now().isoformat(),
        "end_time": (datetime.now() + timedelta(days=1)).isoformat(),
        "outcomes": json.dumps(["Победа", "Ничья", "Поражение"]),
        "created_by": 123456789
    }

def create_test_bet():
    return {
        "event_id": 1,
        "user_id": 123456789,
        "outcome": "Победа",
        "amount": 100.0
    }

# Фикстура для создания тестовой базы данных
@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Фикстура для создания тестового клиента
@pytest.fixture
def client(test_db):
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# Тесты для эндпоинтов
def test_create_event(client):
    # Создаем тестовые данные аутентификации
    auth_data = {
        "user_id": 123456789,
        "is_admin": True
    }
    
    # Создаем событие
    response = client.post(
        "/events/",
        json=create_test_event(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Тестовое событие"
    assert data["description"] == "Описание тестового события"

def test_create_event_unauthorized(client):
    # Создаем тестовые данные аутентификации без прав администратора
    auth_data = {
        "user_id": 123456789,
        "is_admin": False
    }
    
    # Пытаемся создать событие
    response = client.post(
        "/events/",
        json=create_test_event(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    assert response.status_code == 403

def test_create_bet(client):
    # Сначала создаем событие
    auth_data = {
        "user_id": 123456789,
        "is_admin": True
    }
    client.post(
        "/events/",
        json=create_test_event(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    
    # Создаем ставку
    auth_data = {
        "user_id": 123456789,
        "is_admin": False
    }
    response = client.post(
        "/bets/",
        json=create_test_bet(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] == "Победа"
    assert data["amount"] == 100.0

def test_get_events(client):
    # Создаем событие
    auth_data = {
        "user_id": 123456789,
        "is_admin": True
    }
    client.post(
        "/events/",
        json=create_test_event(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    
    # Получаем список событий
    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["title"] == "Тестовое событие"

def test_get_event_results(client):
    # Создаем событие
    auth_data = {
        "user_id": 123456789,
        "is_admin": True
    }
    client.post(
        "/events/",
        json=create_test_event(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    
    # Создаем ставку
    auth_data = {
        "user_id": 123456789,
        "is_admin": False
    }
    client.post(
        "/bets/",
        json=create_test_bet(),
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    
    # Получаем результаты
    response = client.get(
        "/events/1/results",
        headers={"Authorization": f"Bearer {json.dumps(auth_data)}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_bets"] == 1
    assert "Победа" in data["outcome_counts"]
    assert data["outcome_counts"]["Победа"] == 1 