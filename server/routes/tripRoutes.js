const express = require('express');
const { body } = require('express-validator');
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats
} = require('../controllers/tripController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All trip routes require authentication
router.use(auth);

// Validation rules
const createTripValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
  body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
  body('budget').isNumeric().withMessage('Budget must be a number')
];

// Routes
router.get('/', getTrips);
router.get('/stats', getTripStats);
router.get('/:id', getTripById);
router.post('/', createTripValidation, validate, createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
