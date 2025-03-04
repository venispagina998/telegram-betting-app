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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from '../utils/axios';
import WebApp from '@twa-dev/sdk';

const AdminPanel = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(),
    outcomes: '',
    probabilities: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const probabilities = JSON.parse(eventData.probabilities);
      if (Object.values(probabilities).reduce((a, b) => a + b, 0) !== 100) {
        alert('Сумма вероятностей должна быть равна 100%');
        return;
      }
      const response = await axios.post('/events/', {
        ...eventData,
        created_by: WebApp.initDataUnsafe.user.id,
        outcomes: JSON.stringify(eventData.outcomes.split(',').map(o => o.trim())),
        probabilities: JSON.stringify(probabilities),
      });
      console.log('Событие создано:', response.data);
      // Сброс формы
      setEventData({
        title: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(),
        outcomes: '',
        probabilities: '',
      });
      setSnackbar({
        open: true,
        message: 'Событие успешно создано',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при создании события:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при создании события',
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Возможные исходы (через запятую)"
                  name="outcomes"
                  value={eventData.outcomes}
                  onChange={handleChange}
                  required
                  helperText="Например: Победа, Ничья, Поражение"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Вероятности (в формате JSON)"
                  name="probabilities"
                  value={eventData.probabilities}
                  onChange={handleChange}
                  required
                  helperText='Например: {"Победа": 40, "Ничья": 30, "Поражение": 30}'
                />
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