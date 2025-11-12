import React, { useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import useCurrencyStore from './CurrencyStore';
import { currencyNames } from '../data/currencies';

function ExchangeRates() {
  const { baseCurrency, favorites, toggleFavorite, exchangeRates, loading, error, loadExchangeRates } = useCurrencyStore();
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await loadExchangeRates();
      setLastUpdate(new Date().toLocaleTimeString('ru-RU'));
    };
    loadData();
  }, [loadExchangeRates]);

  const sortedCurrencies = Object.keys(exchangeRates).sort((a, b) => {
    const aFavorite = favorites.includes(a);
    const bFavorite = favorites.includes(b);
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    return a.localeCompare(b);
  });

  const formatRate = (currency) => {
    if (baseCurrency === currency) return '1.0000';
    if (exchangeRates[currency]) {
      return exchangeRates[currency].toFixed(4);
    }
    return '—';
  };

  if (loading) {
    return (
      <Card sx={{ p: 4, maxWidth: 800, margin: '0 auto', mt: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">
          Загрузка актуальных курсов...
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #009b76 0%, #006d54 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            📊 Курсы Валют
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Актуальные курсы относительно базовой валюты
          </Typography>
        </Box>
      </Card>

      <Card elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Chip 
            label={`Базовая валюта: ${baseCurrency}`} 
            color="primary" 
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={async () => {
              await loadExchangeRates();
              setLastUpdate(new Date().toLocaleTimeString('ru-RU'));
            }}
            disabled={loading}
            size="small"
            sx={{ ml: 1, mb: 1 }}
          >
            Обновить
          </Button>
          <Typography variant="body2" color="text.secondary">
            {lastUpdate && `Обновлено: ${lastUpdate}`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {Object.keys(exchangeRates).length === 0 && !loading && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Не удалось загрузить актуальные курсы. Используются демо-данные.
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          Нажмите на звездочку ☆ чтобы добавить валюту в избранное
        </Alert>

        {favorites.length > 0 && sortedCurrencies.filter(currency => favorites.includes(currency)).length > 0 && (
          <>
            <Typography variant="h6" gutterBottom color="primary">
              ⭐ Избранные валюты
            </Typography>
            <List>
              {sortedCurrencies
                .filter(currency => favorites.includes(currency))
                .map(currency => (
                  <ListItem 
                    key={currency} 
                    divider
                    secondaryAction={
                      <IconButton 
                        onClick={() => toggleFavorite(currency)}
                        color="primary"
                        size="large"
                      >
                        <Star />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="span">
                          {currency} - {currencyNames[currency] || currency}
                        </Typography>
                      }
                      secondary={`1 ${baseCurrency} = ${formatRate(currency)} ${currency}`}
                    />
                  </ListItem>
                ))}
            </List>
            
            {sortedCurrencies.filter(currency => !favorites.includes(currency)).length > 0 && (
              <Divider sx={{ my: 3 }}>
                <Chip label="Все валюты" size="small" />
              </Divider>
            )}
          </>
        )}

        <List>
          {sortedCurrencies
            .filter(currency => !favorites.includes(currency))
            .map(currency => (
              <ListItem 
                key={currency} 
                divider
                secondaryAction={
                  <IconButton 
                    onClick={() => toggleFavorite(currency)}
                    size="large"
                  >
                    <StarBorder />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="span">
                      {currency} - {currencyNames[currency] || currency}
                    </Typography>
                  }
                  secondary={`1 ${baseCurrency} = ${formatRate(currency)} ${currency}`}
                />
              </ListItem>
            ))}
        </List>

        {sortedCurrencies.length === 0 && !loading && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Нет данных о курсах валют для отображения
          </Alert>
        )}
      </Card>
    </Box>
  );
}

export default ExchangeRates;