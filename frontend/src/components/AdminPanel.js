import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from '../utils/axios';

const AdminPanel = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTestEvent = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        title: "Тестовое событие",
        description: "Описание тестового события",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 123,
        outcomes: "Да,Нет",
        probabilities: {
          "Да": 50,
          "Нет": 50
        }
      };

      console.log('=== Отправляемые данные ===');
      Object.entries(requestData).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(${typeof value})`);
      });
      console.log('JSON данных:', JSON.stringify(requestData, null, 2));

      const response = await axios.post('/events/', requestData);
      console.log('Успешный ответ:', response.data);
      
      setSnackbar({
        open: true,
        message: 'Тестовое событие успешно создано',
        severity: 'success'
      });
    } catch (error) {
      console.error('=== Ошибка при отправке запроса ===');
      if (error.response) {
        console.error('Статус ошибки:', error.response.status);
        console.error('Данные ошибки:', error.response.data);
        
        let errorMessage = 'Ошибка при создании события';
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail
              .map(err => `${err.loc.join('.')}: ${err.msg}`)
              .join('\n');
          } else {
            errorMessage = error.response.data.detail;
          }
        }
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } else {
        console.error('Общая ошибка:', error);
        setSnackbar({
          open: true,
          message: 'Произошла ошибка при создании события',
          severity: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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
        Создание тестового события
      </Typography>

      <Button
        onClick={createTestEvent}
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
        {isSubmitting ? 'Создание...' : 'Создать тестовое событие'}
      </Button>

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