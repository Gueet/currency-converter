import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navigation from './components/Navigation';
import Converter from './components/Converter';
import ExchangeRates from './components/ExchangeRates';
import GeolocationDetector from './components/GeolocationDetector';

const theme = createTheme({
  palette: {
    primary: {
      main: '#009b76',
      light: '#34b18f',
      dark: '#006d54',
    },
    secondary: {
      main: '#ff7e93',
      light: '#ff99a9',
      dark: '#ff657d',
    },
    background: {
      default: '#fff5f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#009b76',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App" style={{ minHeight: '100vh', backgroundColor: '#fff5f7' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Converter />} />
            <Route path="/rates" element={<ExchangeRates />} />
          </Routes>
          <GeolocationDetector />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;