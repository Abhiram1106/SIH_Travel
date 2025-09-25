const express = require('express');
const { body } = require('express-validator');
const {
  searchFlights,
  searchHotels,
  bookFlight,
  bookHotel
} = require('../controllers/bookingController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// Validation rules
const flightSearchValidation = [
  body('origin').trim().notEmpty().withMessage('Origin is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('departureDate').isISO8601().toDate().withMessage('Valid departure date is required'),
  body('passengers').isInt({ min: 1, max: 9 }).withMessage('Passengers must be between 1 and 9')
];

const hotelSearchValidation = [
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('checkIn').isISO8601().toDate().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().toDate().withMessage('Valid check-out date is required'),
  body('guests').isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10')
];

const flightBookingValidation = [
  body('flightId').notEmpty().withMessage('Flight ID is required'),
  body('passengerInfo').isArray({ min: 1 }).withMessage('Passenger information is required')
];

const hotelBookingValidation = [
  body('hotelId').notEmpty().withMessage('Hotel ID is required'),
  body('checkIn').isISO8601().toDate().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().toDate().withMessage('Valid check-out date is required')
];

// Routes
router.post('/flights/search', flightSearchValidation, validate, searchFlights);
router.post('/hotels/search', hotelSearchValidation, validate, searchHotels);
router.post('/flights/book', flightBookingValidation, validate, bookFlight);
router.post('/hotels/book', hotelBookingValidation, validate, bookHotel);

module.exports = router;