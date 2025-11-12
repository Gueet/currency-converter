import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  ListSubheader,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import useCurrencyStore from './CurrencyStore';
import { currencyNames, popularCurrencies } from '../data/currencies';

function Converter() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  
  const { 
    baseCurrency, 
    exchangeRates, 
    favorites,
    loading,
    error 
  } = useCurrencyStore();

  useEffect(() => {
    const { loadExchangeRates } = useCurrencyStore.getState();
    loadExchangeRates();
  }, []);

  useEffect(() => {
    setFromCurrency(baseCurrency);
  }, [baseCurrency]);

  const getSortedCurrencies = () => {
    const availableCurrencies = Object.keys(exchangeRates).length > 0 
      ? Object.keys(exchangeRates) 
      : popularCurrencies;
    
    return [...availableCurrencies].sort((a, b) => {
      const aIsFavorite = favorites.includes(a);
      const bIsFavorite = favorites.includes(b);
      const aIsBase = a === baseCurrency;
      const bIsBase = b === baseCurrency;
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      if (aIsBase && !bIsBase) return -1;
      if (!aIsBase && bIsBase) return 1;
      
      return a.localeCompare(b);
    });
  };

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) return;
    
    setIsConverting(true);
    
    try {
      let converted;
      
      if (fromCurrency === toCurrency) {
        converted = parseFloat(amount).toFixed(2);
      } else {
        const { convertCurrency } = useCurrencyStore.getState();
        converted = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
      }
      
      setResult(converted);
    } catch (error) {
      console.log('Ошибка конвертации:', error);
      setResult('—');
    }
    
    setIsConverting(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const renderCurrencyOptions = (selectedValue) => {
    const sortedCurrencies = getSortedCurrencies();
    const favoriteCurrencies = sortedCurrencies.filter(currency => favorites.includes(currency));
    const otherCurrencies = sortedCurrencies.filter(currency => !favorites.includes(currency));
    
    return [
      ...(favoriteCurrencies.length > 0 ? [
        <ListSubheader key="favorites-header" sx={{ bgcolor: 'background.default' }}>
          ⭐ Избранные
        </ListSubheader>
      ] : []),
      
      ...favoriteCurrencies.map(currency => (
        <MenuItem 
          key={currency} 
          value={currency}
          sx={{
            bgcolor: currency === selectedValue ? 'action.selected' : 'inherit',
            borderRadius: 1,
            mx: 0.5,
            my: 0.2
          }}
        >
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {currency} - {currencyNames[currency] || currency}
            </Typography>
          </Box>
        </MenuItem>
      )),
      
      ...(favoriteCurrencies.length > 0 && otherCurrencies.length > 0 ? [
        <ListSubheader key="other-header" sx={{ bgcolor: 'background.default', mt: 1 }}>
          💰 Все валюты
        </ListSubheader>
      ] : []),
      
      ...otherCurrencies.map(currency => (
        <MenuItem 
          key={currency} 
          value={currency}
          sx={{
            bgcolor: currency === selectedValue ? 'action.selected' : 'inherit',
            borderRadius: 1,
            mx: 0.5,
            my: 0.2
          }}
        >
          <Box>
            <Typography variant="body1">
              {currency} - {currencyNames[currency] || currency}
            </Typography>
          </Box>
        </MenuItem>
      ))
    ];
  };

  return (
    <Box sx={{ maxWidth: 910, margin: '0 auto', p: 2 }}>
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #009b76 0%, #006d54 100%)',
          color: 'white'
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CurrencyExchangeIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Конвертер Валют
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Быстрая конвертация по актуальным курсам
          </Typography>
        </CardContent>
      </Card>

      {/* Основной блок конвертера */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Ваша базовая валюта: 
              <Typography 
                component="span" 
                color="primary" 
                fontWeight="bold"
                sx={{ ml: 1 }}
              >
                {baseCurrency}
              </Typography>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Загрузка актуальных курсов...
              </Typography>
            </Box>
          )}

          {/* Поля ввода */}
          <Grid container spacing={3} alignItems="center">
            {/* Сумма */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Сумма"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setResult(null);
                }}
                fullWidth
                variant="outlined"
                slotProps={{
                  input: {
                    inputProps: { min: 0, step: 0.01 }
                  }
                }}
              />
            </Grid>

            {/* Из валюты */}
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Из валюты"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setResult(null);
                }}
                fullWidth
                variant="outlined"
              >
                {renderCurrencyOptions(fromCurrency)}
              </TextField>
            </Grid>

            {/* Кнопка обмена */}
            <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
              <Button 
                onClick={handleSwap}
                variant="outlined"
                sx={{ 
                  minWidth: 'auto', 
                  borderRadius: '50%',
                  width: 56,
                  height: 56
                }}
              >
                <SwapHorizIcon />
              </Button>
            </Grid>

            {/* В валюту */}
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="В валюту"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setResult(null);
                }}
                fullWidth
                variant="outlined"
              >
                {renderCurrencyOptions(toCurrency)}
              </TextField>
            </Grid>
          </Grid>

          {/* Кнопка конвертации */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleConvert}
              size="large"
              disabled={!amount || isConverting || loading}
              startIcon={isConverting && <CircularProgress size={20} />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: 3,
                backgroundColor: '#009b76',
                '&:hover': {
                  backgroundColor: '#006d54',
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {isConverting ? 'Конвертация...' : 'Конвертировать'}
            </Button>
          </Box>

          {/* Результат */}
          <Fade in={!!result} timeout={500}>
            <Box>
              {result && result !== '—' && (
                <Alert 
                  severity={fromCurrency === toCurrency ? "info" : "success"} 
                  sx={{ 
                    mt: 3, 
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {amount} {fromCurrency} = {result} {toCurrency}
                    </Typography>
                    {fromCurrency === toCurrency && (
                      <Typography variant="body2" color="info.dark">
                        Одинаковые валюты
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}
            </Box>
          </Fade>

          {result === '—' && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography align="center">
                Не удалось получить курс для конвертации
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Демо-данные предупреждение */}
      {Object.keys(exchangeRates).length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          Используются демо-данные о курсах валют
        </Alert>
      )}
    </Box>
  );
}

export default Converter;