const axios = require('axios');

// Get live exchange rates and convert currency
const convertCurrency = async (req, res) => {
  try {
    // More robust parameter extraction with defaults
    const from = req.query.from || req.body.from || 'USD';
    const to = req.query.to || req.body.to || 'EUR';
    const amount = req.query.amount || req.body.amount || '1';
    
    console.log(`💱 Converting ${amount} ${from} to ${to}...`);
    console.log('Query params:', req.query);
    console.log('Body params:', req.body);

    // Validate parameters
    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, amount'
      });
    }

    let exchangeRate;
    let convertedAmount;
    
    // Try to use real API if available
    if (process.env.EXCHANGE_RATE_API_KEY && process.env.EXCHANGE_RATE_API_KEY !== 'your-key') {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
        exchangeRate = response.data.rates[to.toUpperCase()];
        convertedAmount = parseFloat(amount) * exchangeRate;
        
        return res.json({
          success: true,
          data: {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            originalAmount: parseFloat(amount),
            exchangeRate: exchangeRate,
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            lastUpdated: new Date().toISOString()
          }
        });
      } catch (error) {
        console.log('Exchange rate API failed, using mock rates');
        // Continue to mock rates below
      }
    }

    // Mock exchange rates for demo (always executed if no API key)
    const mockRates = {
      'USD': { 
        'EUR': 0.85, 
        'GBP': 0.75, 
        'INR': 83.12, 
        'JPY': 149.50, 
        'AUD': 1.52, 
        'CAD': 1.36, 
        'CHF': 0.88,
        'CNY': 7.23 
      },
      'EUR': { 
        'USD': 1.18, 
        'GBP': 0.88, 
        'INR': 97.84, 
        'JPY': 176.12, 
        'AUD': 1.79, 
        'CAD': 1.60, 
        'CHF': 1.04 
      },
      'GBP': { 
        'USD': 1.33, 
        'EUR': 1.14, 
        'INR': 110.45, 
        'JPY': 199.00, 
        'AUD': 2.02 
      },
      'INR': { 
        'USD': 0.012, 
        'EUR': 0.010, 
        'GBP': 0.009, 
        'JPY': 1.80, 
        'AUD': 0.018 
      }
    };

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    
    let rate = 1;
    if (fromUpper !== toUpper) {
      if (mockRates[fromUpper] && mockRates[fromUpper][toUpper]) {
        rate = mockRates[fromUpper][toUpper];
      } else if (mockRates[toUpper] && mockRates[toUpper][fromUpper]) {
        // Try reverse conversion
        rate = 1 / mockRates[toUpper][fromUpper];
      } else {
        // Default conversion through USD
        const fromToUsd = mockRates[fromUpper] ? mockRates[fromUpper]['USD'] : 1;
        const usdToTo = mockRates['USD'] ? mockRates['USD'][toUpper] : 1;
        rate = fromToUsd * usdToTo;
      }
    }
    
    const converted = parseFloat(amount) * rate;

    res.json({
      success: true,
      data: {
        from: fromUpper,
        to: toUpper,
        originalAmount: parseFloat(amount),
        exchangeRate: rate,
        convertedAmount: Math.round(converted * 100) / 100,
        lastUpdated: new Date().toISOString(),
        source: 'demo_data'
      }
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
      error: error.message
    });
  }
};

// Get popular currencies and their rates
const getCurrencyRates = async (req, res) => {
  try {
    const base = req.query.base || 'USD';
    
    // Mock popular currency rates
    const popularRates = {
      'USD': { 
        'EUR': 0.85, 
        'GBP': 0.75, 
        'INR': 83.12, 
        'JPY': 149.50, 
        'AUD': 1.52, 
        'CAD': 1.36, 
        'CHF': 0.88 
      },
      'EUR': { 
        'USD': 1.18, 
        'GBP': 0.88, 
        'INR': 97.84, 
        'JPY': 176.12, 
        'AUD': 1.79, 
        'CAD': 1.60, 
        'CHF': 1.04 
      },
      'INR': {
        'USD': 0.012,
        'EUR': 0.010,
        'GBP': 0.009,
        'JPY': 1.80,
        'AUD': 0.018
      }
    };

    const rates = popularRates[base.toUpperCase()] || popularRates['USD'];
    
    res.json({
      success: true,
      data: {
        base: base.toUpperCase(),
        rates: rates,
        lastUpdated: new Date().toISOString(),
        source: 'demo_data'
      }
    });
  } catch (error) {
    console.error('Currency rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get currency rates',
      error: error.message
    });
  }
};

module.exports = {
  convertCurrency,
  getCurrencyRates
};
