from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import hmac
import hashlib
import json
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

def verify_telegram_data(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    try:
        # Получаем данные из заголовка
        init_data = credentials.credentials
        
        # Разбираем данные
        data = dict(item.split('=') for item in init_data.split('&'))
        
        # Получаем хеш и удаляем его из данных
        received_hash = data.pop('hash', None)
        if not received_hash:
            raise HTTPException(status_code=401, detail="No hash provided")
        
        # Сортируем оставшиеся данные
        data_check_string = '&'.join(f"{k}={v}" for k, v in sorted(data.items()))
        
        # Получаем токен бота из переменных окружения
        bot_token = os.getenv('BOT_TOKEN')
        if not bot_token:
            raise HTTPException(status_code=500, detail="Bot token not configured")
        
        # Создаем секретный ключ
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        
        # Вычисляем хеш
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Проверяем хеш
        if calculated_hash != received_hash:
            raise HTTPException(status_code=401, detail="Invalid hash")
        
        # Проверяем время
        if int(data.get('auth_date', 0)) < 0:  # Можно добавить проверку на актуальность времени
            raise HTTPException(status_code=401, detail="Auth data expired")
        
        # Получаем данные пользователя
        user_data = json.loads(data.get('user', '{}'))
        
        return {
            'user_id': user_data.get('id'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'username': user_data.get('username'),
            'language_code': user_data.get('language_code'),
            'start_param': user_data.get('start_param'),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e)) 