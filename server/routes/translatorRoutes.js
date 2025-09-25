const express = require('express');
const { body, query } = require('express-validator');
const {
  translateText,
  getTravelPhrases,
  getSupportedLanguages
} = require('../controllers/translatorController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All translation routes require authentication
router.use(auth);

// Validation rules
const translateValidation = [
  body('text').trim().notEmpty().withMessage('Text to translate is required'),
  body('from').isLength({ min: 2, max: 2 }).withMessage('From language must be 2 characters'),
  body('to').isLength({ min: 2, max: 2 }).withMessage('To language must be 2 characters')
];

// Routes
router.post('/translate', translateValidation, validate, translateText);
router.get('/phrases', getTravelPhrases);
router.get('/languages', getSupportedLanguages);

module.exports = router;
