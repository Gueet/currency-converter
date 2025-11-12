import React, { useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import useCurrencyStore from './CurrencyStore';

function GeolocationDetector() {
  const { baseCurrency, detectCurrencyByGeolocation } = useCurrencyStore();
  const [open, setOpen] = React.useState(false);
  const [detectedCurrency, setDetectedCurrency] = React.useState(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('has-visited');
    
    if (!hasVisited) {
      detectCurrencyByGeolocation().then((currency) => {
        setDetectedCurrency(currency);
        setOpen(true);
        localStorage.setItem('has-visited', 'true');
      });
    }
  }, [detectCurrencyByGeolocation]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert 
        onClose={handleClose} 
        severity="info" 
        action={
          <Button color="inherit" size="small" onClick={handleClose}>
            OK
          </Button>
        }
      >
        {detectedCurrency ? 
          `Определена ваша валюта: ${detectedCurrency}. Вы можете изменить её в настройках.` : 
          'Не удалось определить вашу валюту. Используется USD по умолчанию.'
        }
      </Alert>
    </Snackbar>
  );
}

export default GeolocationDetector;