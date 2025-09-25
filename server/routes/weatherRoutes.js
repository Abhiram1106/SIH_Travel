const express = require('express');
const { param } = require('express-validator');
const { getWeather } = require('../controllers/weatherController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All weather routes require authentication
router.use(auth);

// Validation rules
const locationValidation = [
  param('location').trim().notEmpty().withMessage('Location is required')
];

// Routes
router.get('/:location', locationValidation, validate, getWeather);

module.exports = router;