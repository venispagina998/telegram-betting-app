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
} from '@mui/material';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const PlaceBet = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [betData, setBetData] = useState({
    outcome: '',
    amount: '',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/bets/', {
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

  if (!event) {
    return <Typography>Loading...</Typography>;
  }

  const outcomes = JSON.parse(event.outcomes);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Place Your Bet
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {event.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {event.description}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Outcome</InputLabel>
                  <Select
                    name="outcome"
                    value={betData.outcome}
                    onChange={handleChange}
                    label="Select Outcome"
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
                  label="Bet Amount"
                  name="amount"
                  type="number"
                  value={betData.amount}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Place Bet
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PlaceBet; 