import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  Fade,
  Skeleton,
} from '@mui/material';
import { AccessTime, TrendingUp } from '@mui/icons-material';
import axios from '../utils/axios';
import WebApp from '@twa-dev/sdk';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/events/');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (now < startTime) {
      return { label: 'Скоро', color: 'info' };
    } else if (now > endTime) {
      return { label: 'Завершено', color: 'default' };
    } else {
      return { label: 'Активно', color: 'success' };
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          mb: 4,
          background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Доступные события
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="rectangular" height={100} sx={{ my: 2 }} />
                  <Skeleton variant="text" height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          events.map((event, index) => (
            <Grid item xs={12} key={event.id}>
              <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      '& .event-title': {
                        color: '#2196f3',
                      },
                    },
                  }}
                  onClick={() => handleEventClick(event.id)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography 
                        variant="h6" 
                        component="h2"
                        className="event-title"
                        sx={{ 
                          transition: 'color 0.2s ease-in-out',
                          fontWeight: 600,
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Chip
                        label={getEventStatus(event).label}
                        color={getEventStatus(event).color}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                      <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {new Date(event.start_time).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      component="p"
                      sx={{ 
                        mb: 2,
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {event.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<TrendingUp />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                      >
                        Сделать ставку
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default EventsList; 