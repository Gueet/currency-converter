import axios from 'axios';

class CurrencyApiService {
  // Список API
  APIs = [
    {
      name: 'Frankfurter',
      url: (base) => `https://api.frankfurter.app/latest?from=${base}`,
      parser: (data) => data.rates
    },
    {
      name: 'ExchangeRate-API',
      url: (base) => `https://api.exchangerate-api.com/v4/latest/${base}`,
      parser: (data) => data.rates
    },
    {
      name: 'CurrencyAPI',
      url: (base) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@1/latest/currencies/${base.toLowerCase()}.json`,
      parser: (data, base) => data[base.toLowerCase()]
    }
  ];

  async getExchangeRates(baseCurrency = 'USD') {
    console.log(`Загрузка курсов для ${baseCurrency}...`);

    for (const api of this.APIs) {
      try {
        console.log(`Пробуем ${api.name}...`);
        const response = await axios.get(api.url(baseCurrency), {
          timeout: 5000
        });

        if (response.data) {
          let rates;
          if (api.name === 'CurrencyAPI') {
            rates = api.parser(response.data, baseCurrency);
          } else {
            rates = api.parser(response.data);
          }

          if (rates && Object.keys(rates).length > 0) {
            console.log(`Данные получены от ${api.name}`);
            
            if (api.name === 'CurrencyAPI') {
              const upperCaseRates = {};
              Object.keys(rates).forEach(key => {
                upperCaseRates[key.toUpperCase()] = rates[key];
              });
              return upperCaseRates;
            }
            
            return rates;
          }
        }
      } catch (error) {
        console.log(`${api.name} не доступен:`, error.message);
        continue; 
      }
    }

    console.log('Все API недоступны, используем демо-данные');
    return this.getDemoRates(baseCurrency);
  }

  getDemoRates(baseCurrency) {
    const currentRates = {
      USD: { 
        EUR: 0.92, GBP: 0.79, JPY: 148.25, CAD: 1.35, 
        AUD: 1.52, CHF: 0.88, CNY: 7.18, RUB: 81.19,
        TRY: 28.95, INR: 83.12, BRL: 4.93, MXN: 17.05
      },
      EUR: { 
        USD: 1.09, GBP: 0.86, JPY: 161.25, CAD: 1.47, 
        AUD: 1.65, CHF: 0.96, CNY: 7.82, RUB: 88.35,
        TRY: 31.52, INR: 90.45, BRL: 5.36, MXN: 18.52
      },
      RUB: { 
        USD: 0.0123, EUR: 0.0113, GBP: 0.0097, JPY: 1.83, 
        CAD: 0.0166, AUD: 0.0187, CHF: 0.0108, CNY: 0.0885,
        TRY: 0.356, INR: 1.024, BRL: 0.0607, MXN: 0.210
      },
      GBP: { 
        USD: 1.27, EUR: 1.16, JPY: 187.65, CAD: 1.71, 
        AUD: 1.92, CHF: 1.11, CNY: 9.08, RUB: 103.15,
        TRY: 36.72, INR: 105.28, BRL: 6.24, MXN: 21.55
      }
    };

    const baseRates = { 
      [baseCurrency]: 1.0, 
      ...(currentRates[baseCurrency] || currentRates.USD) 
    };
    
    return baseRates;
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return parseFloat(amount).toFixed(2);

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      
      if (rates && rates[toCurrency]) {
        const result = (parseFloat(amount) * rates[toCurrency]).toFixed(2);
        console.log(`Конвертация: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
        return result;
      } else {
        console.log(`Курс для ${toCurrency} не найден`);
      }
    } catch (error) {
      console.log('Ошибка конвертации:', error);
    }
    
    return null;
  }

  async getLastUpdateTime() {
    return new Date().toLocaleTimeString('ru-RU');
  }
}

const currencyApi = new CurrencyApiService();
export default currencyApi;