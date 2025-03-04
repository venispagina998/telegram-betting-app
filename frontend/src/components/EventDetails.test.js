import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventDetails from './EventDetails';
import axios from '../utils/axios';
import WebApp from '@twa-dev/sdk';

// Мокаем axios
jest.mock('../utils/axios');

// Мокаем WebApp
jest.mock('@twa-dev/sdk', () => ({
  initData: 'test_init_data',
  initDataUnsafe: {
    user: {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'ru',
      start_param: 'test'
    }
  },
  ready: jest.fn(),
  showAlert: jest.fn()
}));

// Тестовые данные
const mockEvent = {
  id: 1,
  title: 'Тестовое событие',
  description: 'Описание тестового события',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 86400000).toISOString(), // +1 день
  outcomes: JSON.stringify(['Победа', 'Ничья', 'Поражение']),
  created_by: 123456789,
  status: 'active'
};

const mockResults = {
  event_id: 1,
  total_bets: 2,
  outcome_counts: {
    'Победа': 1,
    'Ничья': 1
  }
};

const mockUserBets = [
  {
    id: 1,
    event_id: 1,
    user_id: 123456789,
    outcome: 'Победа',
    amount: 100.0,
    placed_at: new Date().toISOString()
  }
];

// Настраиваем моки axios
axios.get.mockImplementation((url) => {
  if (url.includes('/results')) {
    return Promise.resolve({ data: mockResults });
  } else if (url.includes('/user-bets')) {
    return Promise.resolve({ data: mockUserBets });
  } else {
    return Promise.resolve({ data: mockEvent });
  }
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EventDetails Component', () => {
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  test('отображает информацию о событии', async () => {
    renderWithRouter(<EventDetails />);

    // Проверяем загрузку
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Тестовое событие')).toBeInTheDocument();
      expect(screen.getByText('Описание тестового события')).toBeInTheDocument();
      expect(screen.getByText('Активно')).toBeInTheDocument();
    });
  });

  test('отображает возможные исходы', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Победа')).toBeInTheDocument();
      expect(screen.getByText('Ничья')).toBeInTheDocument();
      expect(screen.getByText('Поражение')).toBeInTheDocument();
    });
  });

  test('отображает статистику ставок', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Всего ставок')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('показывает график при нажатии на кнопку', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).not.toBeInTheDocument();
    });

    const chartButton = screen.getByRole('button', { name: /bar chart/i });
    fireEvent.click(chartButton);

    // Проверяем, что график отображается
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('показывает ставки пользователя при нажатии на кнопку', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).not.toBeInTheDocument();
    });

    const historyButton = screen.getByRole('button', { name: /history/i });
    fireEvent.click(historyButton);

    // Проверяем, что ставки пользователя отображаются
    expect(screen.getByText('Ваши ставки:')).toBeInTheDocument();
    expect(screen.getByText('Победа')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('показывает диалог при нажатии на кнопку поделиться', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).not.toBeInTheDocument();
    });

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    // Проверяем, что диалог отображается
    expect(screen.getByText('Поделиться событием')).toBeInTheDocument();
  });

  test('обрабатывает ошибки при загрузке данных', async () => {
    // Мокаем ошибку
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка при загрузке данных')).toBeInTheDocument();
    });
  });
}); 