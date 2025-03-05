import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// Создаем экземпляр axios с базовой конфигурацией
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для добавления данных аутентификации
instance.interceptors.request.use(
  (config) => {
    console.log('Отправка запроса:', config.url, config.method);
    console.log('Данные запроса:', config.data);
    
    // Получаем initData из Telegram Web App
    const initData = WebApp.initData;
    
    // Добавляем данные аутентификации в заголовок
    if (initData) {
      config.headers.Authorization = `Bearer ${initData}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Ошибка при подготовке запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ответов
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default instance; 