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
      // Тестовые данные для отправки
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
        message: 'Событие успешно создано',
        severity: 'success'
      });

      // Сброс формы
      setEventData({
        title: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(),
      });
      setOutcomes([{ name: '', probability: '' }]);
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