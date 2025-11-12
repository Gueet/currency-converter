import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

function Navigation() {
  const location = useLocation();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#009b76' }}>
      <Toolbar>
        <CurrencyExchangeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Конвертер Валют
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            variant={location.pathname === '/' ? "outlined" : "text"}
            sx={{ 
              borderColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Конвертер
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/rates"
            variant={location.pathname === '/rates' ? "outlined" : "text"}
            sx={{ 
              ml: 2,
              borderColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Курсы валют
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;