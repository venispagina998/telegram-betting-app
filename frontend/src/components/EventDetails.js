import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Share as ShareIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import WebApp from '@twa-dev/sdk';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '../utils/axios';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [results, setResults] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [showUserBets, setShowUserBets] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [eventResponse, resultsResponse, userBetsResponse] = await Promise.all([
          axios.get(`/events/${id}`),
          axios.get(`/events/${id}/results`),
          axios.get(`/events/${id}/user-bets/${WebApp.initDataUnsafe.user.id}`)
        ]);
        setEvent(eventResponse.data);
        setResults(resultsResponse.data);
        setUserBets(userBetsResponse.data);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке данных',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handlePlaceBet = () => {
    navigate(`/bet/${id}`);
  };

  const handleShare = () => {
    const link = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`;
    setShareLink(link);
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: 'Ссылка скопирована в буфер обмена',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
  const isEventActive = new Date(event.end_time) > new Date();
  const statusColor = isEventActive ? 'success' : 'error';

  // Подготовка данных для графика
  const chartData = results?.outcome_counts ? 
    Object.entries(results.outcome_counts).map(([outcome, count]) => ({
      outcome,
      count
    })) : [];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1">
                  {event.title}
                </Typography>
                <Box>
                  <IconButton onClick={handleShare} color="primary">
                    <ShareIcon />
                  </IconButton>
                  <IconButton onClick={() => setShowChart(!showChart)} color="primary">
                    <BarChartIcon />
                  </IconButton>
                  <IconButton onClick={() => setShowUserBets(!showUserBets)} color="primary">
                    <HistoryIcon />
                  </IconButton>
                  <Chip
                    label={isEventActive ? 'Активно' : 'Завершено'}
                    color={statusColor}
                    size="large"
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary">
                {event.description}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Начало:
              </Typography>
              <Typography variant="body1">
                {new Date(event.start_time).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Конец:
              </Typography>
              <Typography variant="body1">
                {new Date(event.end_time).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Возможные исходы:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {outcomes.map((outcome) => (
                  <Chip
                    key={outcome}
                    label={outcome}
                    variant="outlined"
                    size="medium"
                  />
                ))}
              </Box>
            </Grid>

            {isEventActive && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handlePlaceBet}
                  >
                    Сделать ставку
                  </Button>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Статистика ставок:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Всего ставок"
                      secondary={results?.total_bets || 0}
                    />
                  </ListItem>
                  {results?.outcome_counts && Object.entries(results.outcome_counts).map(([outcome, count]) => (
                    <ListItem key={outcome}>
                      <ListItemText
                        primary={outcome}
                        secondary={`${count} ставок`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {showChart && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, mt: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="outcome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088cc" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {showUserBets && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Ваши ставки:
                  </Typography>
                  {userBets.length > 0 ? (
                    <List>
                      {userBets.map((bet) => (
                        <ListItem key={bet.id}>
                          <ListItemText
                            primary={`Исход: ${bet.outcome}`}
                            secondary={`Сумма: ${bet.amount} | Время: ${new Date(bet.placed_at).toLocaleString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="textSecondary">
                      У вас пока нет ставок на это событие
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Поделиться событием</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Закрыть</Button>
          <Button onClick={handleCopyLink} color="primary">
            Копировать ссылку
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetails; 