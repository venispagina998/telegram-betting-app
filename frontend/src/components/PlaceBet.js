import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  ArrowBack,
} from '@mui/icons-material';
import axios from '../utils/axios';
import WebApp from '@twa-dev/sdk';

const PlaceBet = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betData, setBetData] = useState({
    outcome: '',
    amount: '',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/bets/', {
        ...betData,
        event_id: parseInt(eventId),
        user_id: WebApp.initDataUnsafe.user.id,
        amount: parseFloat(betData.amount),
      });
      console.log('Bet placed:', response.data);
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Событие не найдено</Typography>
      </Container>
    );
  }

  const outcomes = JSON.parse(event.outcomes);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={500}>
        <Card>
          <CardContent>
            <Box 
              display="flex" 
              alignItems="center" 
              mb={3}
              sx={{
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/event/${eventId}`)}
                sx={{ mr: 2 }}
              >
                Назад
              </Button>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Разместить ставку
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {event.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {event.description}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Начало:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(event.start_time).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Конец:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(event.end_time).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    mb: 3,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Возможные исходы:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {outcomes.map((outcome) => (
                      <Chip
                        key={outcome}
                        label={outcome}
                        variant="outlined"
                        size="medium"
                        sx={{
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl fullWidth required>
                          <InputLabel>Выберите исход</InputLabel>
                          <Select
                            name="outcome"
                            value={betData.outcome}
                            onChange={handleChange}
                            label="Выберите исход"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                              },
                            }}
                          >
                            {outcomes.map((outcome) => (
                              <MenuItem key={outcome} value={outcome}>
                                {outcome}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Сумма ставки"
                          name="amount"
                          type="number"
                          value={betData.amount}
                          onChange={handleChange}
                          required
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<TrendingUp />}
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
                          Разместить ставку
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default PlaceBet; 