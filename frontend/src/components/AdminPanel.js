import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../utils/axios';
import WebApp from '@twa-dev/sdk';

const AdminPanel = () => {
  const [eventData, setEventData] = useState({
    title: 'Сделаю приложение или нет',
    description: 'Джас да или нет',
    start_time: new Date(),
    end_time: new Date(new Date().setDate(new Date().getDate() + 4)),
  });

  const [outcomes, setOutcomes] = useState([
    { name: 'Да', probability: '50' },
    { name: 'Нет', probability: '50' }
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('Начало отправки формы');
      console.log('Данные события:', eventData);
      console.log('Исходы:', outcomes);

      // Проверяем, что все поля заполнены
      if (!eventData.title || !eventData.description) {
        console.log('Ошибка: не заполнены основные поля');
        setSnackbar({
          open: true,
          message: 'Пожалуйста, заполните название и описание события',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что время окончания позже времени начала
      if (eventData.end_time <= eventData.start_time) {
        console.log('Ошибка: некорректное время');
        setSnackbar({
          open: true,
          message: 'Время окончания должно быть позже времени начала',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что все исходы и вероятности заполнены
      if (outcomes.some(outcome => !outcome.name || !outcome.probability)) {
        console.log('Ошибка: не заполнены исходы или вероятности');
        setSnackbar({
          open: true,
          message: 'Пожалуйста, заполните все исходы и их вероятности',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что сумма вероятностей равна 100
      const totalProbability = outcomes.reduce((sum, outcome) => sum + Number(outcome.probability), 0);
      console.log('Общая вероятность:', totalProbability);
      
      if (totalProbability !== 100) {
        console.log('Ошибка: сумма вероятностей не равна 100%');
        setSnackbar({
          open: true,
          message: 'Сумма вероятностей должна быть равна 100%',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что все вероятности положительные числа
      if (outcomes.some(outcome => Number(outcome.probability) <= 0)) {
        console.log('Ошибка: некорректные вероятности');
        setSnackbar({
          open: true,
          message: 'Все вероятности должны быть положительными числами',
          severity: 'error'
        });
        return;
      }

      // Формируем объект вероятностей
      const probabilities = {};
      outcomes.forEach(outcome => {
        if (outcome.name && outcome.probability) {
          const name = String(outcome.name).trim();
          const probability = parseInt(outcome.probability, 10);
          if (!isNaN(probability)) {
            probabilities[name] = probability;
          }
        }
      });

      console.log('Исходы до преобразования:', outcomes);
      console.log('Объект вероятностей:', probabilities);

      // Получаем ID пользователя
      let userId;
      try {
        userId = WebApp.initDataUnsafe.user.id;
      } catch (error) {
        console.log('Не удалось получить ID пользователя из Telegram, используем тестовый ID');
        userId = 123;
      }

      // Формируем данные для отправки
      const requestData = {
        title: String(eventData.title).trim(),
        description: String(eventData.description).trim(),
        start_time: eventData.start_time.toISOString(),
        end_time: eventData.end_time.toISOString(),
        created_by: userId,
        outcomes: outcomes
          .filter(o => o.name)
          .map(o => String(o.name).trim())
          .join(','),
        probabilities
      };

      // Подробное логирование
      console.log('=== Отправляемые данные ===');
      Object.entries(requestData).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(${typeof value})`);
      });
      console.log('JSON данных:', JSON.stringify(requestData, null, 2));

      try {
        const response = await axios.post('/events/', requestData);
        console.log('Успешный ответ:', response.data);
        
        // Сброс формы
        setEventData({
          title: '',
          description: '',
          start_time: new Date(),
          end_time: new Date(),
        });
        setOutcomes([{ name: '', probability: '' }]);

        setSnackbar({
          open: true,
          message: 'Событие успешно создано',
          severity: 'success'
        });
      } catch (axiosError) {
        console.error('=== Ошибка при отправке запроса ===');
        console.error('Статус ошибки:', axiosError.response?.status);
        console.error('Данные ошибки:', axiosError.response?.data);
        
        if (axiosError.response?.status === 500) {
          console.error('Серверная ошибка:', axiosError.response?.data);
          console.error('Отправленные данные:', JSON.stringify(requestData, null, 2));
          setSnackbar({
            open: true,
            message: 'Произошла ошибка на сервере. Пожалуйста, проверьте формат данных и попробуйте снова.',
            severity: 'error'
          });
          return;
        }

        if (axiosError.response?.data?.detail) {
          console.error('Детали ошибки:', JSON.stringify(axiosError.response.data.detail, null, 2));
          if (Array.isArray(axiosError.response.data.detail)) {
            axiosError.response.data.detail.forEach((error, index) => {
              console.error(`Ошибка ${index + 1}:`, {
                путь: error.loc,
                сообщение: error.msg,
                тип: error.type
              });
            });
          }
        }

        let errorMessage = 'Ошибка при создании события';
        if (axiosError.response?.data?.detail) {
          if (Array.isArray(axiosError.response.data.detail)) {
            errorMessage = axiosError.response.data.detail
              .map(err => `${err.loc.join('.')}: ${err.msg}`)
              .join('\n');
          } else {
            errorMessage = axiosError.response.data.detail;
          }
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Общая ошибка:', error);
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при обработке формы',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setEventData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleOutcomeChange = (index, field, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    setOutcomes(newOutcomes);
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, { name: '', probability: '' }]);
  };

  const removeOutcome = (index) => {
    const newOutcomes = outcomes.filter((_, i) => i !== index);
    setOutcomes(newOutcomes);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontWeight: 600,
          background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Создание нового события
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название события"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Время начала"
                  value={eventData.start_time}
                  onChange={(date) => handleDateChange(date, 'start_time')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Время окончания"
                  value={eventData.end_time}
                  onChange={(date) => handleDateChange(date, 'end_time')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              
              {/* Исходы и вероятности */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Исходы и вероятности
                </Typography>
                {outcomes.map((outcome, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label={`Исход ${index + 1}`}
                        value={outcome.name}
                        onChange={(e) => handleOutcomeChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Вероятность"
                        type="number"
                        value={outcome.probability}
                        onChange={(e) => handleOutcomeChange(index, 'probability', e.target.value)}
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton 
                        onClick={() => removeOutcome(index)}
                        disabled={outcomes.length === 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOutcome}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Добавить исход
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(33, 150, 243, 0.4)',
                    },
                  }}
                >
                  {isSubmitting ? 'Создание...' : 'Создать событие'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel; 