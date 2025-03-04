import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import WebApp from '@twa-dev/sdk';

const Navigation = () => {
  const navigate = useNavigate();
  const isAdmin = WebApp.initDataUnsafe.user?.is_admin || false;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Betting App
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/')}>
            Events
          </Button>
          {isAdmin && (
            <Button color="inherit" onClick={() => navigate('/admin')}>
              Admin Panel
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 