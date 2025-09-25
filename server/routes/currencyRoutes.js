const express = require('express');
const { query, body } = require('express-validator');
const {
  convertCurrency,
  getCurrencyRates
} = require('../controllers/currencyController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All currency routes require authentication
router.use(auth);

// Validation rules
const convertValidation = [
  query('from').isLength({ min: 3, max: 3 }).withMessage('From currency must be 3 characters'),
  query('to').isLength({ min: 3, max: 3 }).withMessage('To currency must be 3 characters'),
  query('amount').isNumeric().withMessage('Amount must be a number')
];

const ratesValidation = [
  query('base').optional().isLength({ min: 3, max: 3 }).withMessage('Base currency must be 3 characters')
];

// Routes
router.get('/convert', convertValidation, validate, convertCurrency);
router.get('/rates', ratesValidation, validate, getCurrencyRates);

// Get popular currencies
router.get('/popular', (req, res) => {
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' }
  ];

  res.json({
    success: true,
    data: popularCurrencies
  });
});

module.exports = router;