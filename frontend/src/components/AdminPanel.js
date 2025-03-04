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
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(),
  });

  const [outcomes, setOutcomes] = useState([
    { name: '', probability: '' }
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Проверяем, что все поля заполнены
      if (!eventData.title || !eventData.description) {
        setSnackbar({
          open: true,
          message: 'Пожалуйста, заполните название и описание события',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что время окончания позже времени начала
      if (eventData.end_time <= eventData.start_time) {
        setSnackbar({
          open: true,
          message: 'Время окончания должно быть позже времени начала',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что все исходы и вероятности заполнены
      if (outcomes.some(outcome => !outcome.name || !outcome.probability)) {
        setSnackbar({
          open: true,
          message: 'Пожалуйста, заполните все исходы и их вероятности',
          severity: 'error'
        });
        return;
      }

      // Проверяем, что сумма вероятностей равна 100
      const totalProbability = outcomes.reduce((sum, outcome) => sum + Number(outcome.probability), 0);
      if (totalProbability !== 100) {
        setSnackbar({
          open: true,
          message: 'Сумма вероятностей должна быть равна 100%',
          severity: 'error'
        });
        return;
      }

      // Формируем объект вероятностей
      const probabilities = outcomes.reduce((acc, outcome) => {
        acc[outcome.name] = Number(outcome.probability);
        return acc;
      }, {});

      console.log('Отправка данных:', {
        ...eventData,
        created_by: WebApp.initDataUnsafe.user.id,
        outcomes: JSON.stringify(outcomes.map(o => o.name)),
        probabilities: JSON.stringify(probabilities),
      });

      const response = await axios.post('/events/', {
        ...eventData,
        created_by: WebApp.initDataUnsafe.user.id,
        outcomes: JSON.stringify(outcomes.map(o => o.name)),
        probabilities: JSON.stringify(probabilities),
      });

      console.log('Ответ сервера:', response.data);
      
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
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      console.error('Детали ошибки:', error.response?.data);
      
      let errorMessage = 'Ошибка при создании события';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
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
                  Создать событие
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