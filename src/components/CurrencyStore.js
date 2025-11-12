import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import currencyApi from '../services/currencyApi';

const countryToCurrency = {
  'US': 'USD', 'RU': 'RUB', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
  'GB': 'GBP', 'JP': 'JPY', 'CA': 'CAD', 'AU': 'AUD', 'CN': 'CNY', 'IN': 'INR',
  'BR': 'BRL', 'MX': 'MXN', 'KR': 'KRW', 'TR': 'TRY', 'CH': 'CHF'
};

const useCurrencyStore = create(
  persist(
    (set, get) => ({
      baseCurrency: 'USD',
      favorites: ['EUR', 'GBP', 'RUB'],
      exchangeRates: {},
      loading: false,
      error: null,
      
      setBaseCurrency: async (currency) => {
        set({ baseCurrency: currency, loading: true, error: null });
        try {
          const rates = await currencyApi.getExchangeRates(currency);
          set({ exchangeRates: rates, loading: false });
        } catch (error) {
          set({ error: 'Ошибка загрузки курсов', loading: false });
        }
      },
      
      loadExchangeRates: async () => {
        const { baseCurrency } = get();
        set({ loading: true, error: null });
        try {
          const rates = await currencyApi.getExchangeRates(baseCurrency);
          set({ exchangeRates: rates, loading: false });
        } catch (error) {
          set({ error: 'Ошибка загрузки курсов', loading: false });
        }
      },
      
      toggleFavorite: (currency) => set((state) => {
        const isFavorite = state.favorites.includes(currency);
        if (isFavorite) {
          return { favorites: state.favorites.filter(fav => fav !== currency) };
        } else {
          return { favorites: [...state.favorites, currency] };
        }
      }),
      
      setExchangeRates: (rates) => set({ exchangeRates: rates }),
      
      convertCurrency: (amount, from, to) => {
        if (from === to) return parseFloat(amount).toFixed(2);

        const rates = get().exchangeRates;
        if (rates[from] && rates[to]) {
          const result = (parseFloat(amount) * rates[to] / rates[from]).toFixed(2);
          return result;
        }
        return '—';
      },
      
      detectCurrencyByGeolocation: () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve('USD');
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`
                );
                const data = await response.json();
                const countryCode = data.countryCode;
                const detectedCurrency = countryToCurrency[countryCode] || 'USD';
                
                // Устанавливаем валюту и загружаем курсы
                get().setBaseCurrency(detectedCurrency);
                resolve(detectedCurrency);
              } catch (error) {
                console.log('Ошибка определения локации:', error);
                resolve('USD');
              }
            },
            (error) => {
              console.log('Геолокация недоступна:', error);
              resolve('USD');
            }
          );
        });
      }
    }),
    {
      name: 'currency-storage',
    }
  )
);

export default useCurrencyStore;