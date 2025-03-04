import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// Создаем экземпляр axios с базовой конфигурацией
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для добавления данных аутентификации
instance.interceptors.request.use((config) => {
  // Получаем initData из Telegram Web App
  const initData = WebApp.initData;
  
  // Добавляем данные аутентификации в заголовок
  if (initData) {
    config.headers.Authorization = `Bearer ${initData}`;
  }
  
  return config;
});

// Добавляем перехватчик для обработки ошибок
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance; 