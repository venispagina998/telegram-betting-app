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
  DialogActions
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from 'axios';
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
        alert('Probabilities must sum to 100');
        return;
      }
      const response = await axios.post('http://localhost:8000/events/', {
        ...eventData,
        created_by: WebApp.initDataUnsafe.user.id,
        outcomes: JSON.stringify(eventData.outcomes.split(',').map(o => o.trim())),
        probabilities: JSON.stringify(probabilities),
      });
      console.log('Event created:', response.data);
      // Reset form
      setEventData({
        title: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(),
        outcomes: '',
        probabilities: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Event
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
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
                  label="Start Time"
                  value={eventData.start_time}
                  onChange={(date) => handleDateChange(date, 'start_time')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Time"
                  value={eventData.end_time}
                  onChange={(date) => handleDateChange(date, 'end_time')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Possible Outcomes (comma-separated)"
                  name="outcomes"
                  value={eventData.outcomes}
                  onChange={handleChange}
                  helperText="Enter possible outcomes separated by commas"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Probabilities (JSON format)"
                  name="probabilities"
                  value={eventData.probabilities}
                  onChange={handleChange}
                  helperText='Example: {"Outcome1": 50, "Outcome2": 50}'
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Create Event
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminPanel; 