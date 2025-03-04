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
  Fade,
} from '@mui/material';
import {
  Share as ShareIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  AccessTime,
  TrendingUp,
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={500}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
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
                    {event.title}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton 
                      onClick={handleShare} 
                      color="primary"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        },
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => setShowChart(!showChart)} 
                      color="primary"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        },
                      }}
                    >
                      <BarChartIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => setShowUserBets(!showUserBets)} 
                      color="primary"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        },
                      }}
                    >
                      <HistoryIcon />
                    </IconButton>
                    <Chip
                      label={isEventActive ? 'Активно' : 'Завершено'}
                      color={statusColor}
                      size="large"
                      sx={{
                        fontWeight: 500,
                        height: 32,
                        '& .MuiChip-label': {
                          px: 2,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                    mb: 3,
                  }}
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

              {isEventActive && (
                <Grid item xs={12}>
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    mt={2}
                    sx={{
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handlePlaceBet}
                      startIcon={<TrendingUp />}
                      sx={{
                        px: 4,
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
                      Сделать ставку
                    </Button>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    mt: 3,
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
                    Статистика ставок:
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Всего ставок"
                          secondary={results?.total_bets || 0}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {results?.outcome_counts && Object.entries(results.outcome_counts).map(([outcome, count]) => (
                        <ListItem key={outcome}>
                          <ListItemText
                            primary={outcome}
                            secondary={`${count} ставок`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              </Grid>

              {showChart && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      height: 300,
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="outcome" 
                          stroke="rgba(255, 255, 255, 0.7)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.7)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e1e1e', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 8,
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#2196f3"
                          radius={[4, 4, 0, 0]}
                        />
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
      </Fade>

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

export default EventDetails; 