import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WebApp from '@twa-dev/sdk';
import EventsList from './components/EventsList';
import EventDetails from './components/EventDetails';
import PlaceBet from './components/PlaceBet';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';

// Initialize Telegram WebApp
WebApp.ready();

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0088cc',
    },
    secondary: {
      main: '#ff3b30',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/bet/:eventId" element={<PlaceBet />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 