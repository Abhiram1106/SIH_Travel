// Enhanced AI Routes
const express = require('express');
const { body, query } = require('express-validator');
const {
  generateRecommendations,
  generateItinerary,
  getTravelInsights,
  getPackingSuggestions
} = require('../controllers/aiController');
const {
  getChatResponse,
  getChatHistory,
  getSmartAnswer
} = require('../controllers/aiChatbotController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All AI routes require authentication
router.use(auth);

// Validation rules
const recommendationsValidation = [
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('preferences.budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('preferences.interests').optional().isArray().withMessage('Interests must be an array')
];

const itineraryValidation = [
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
  body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('interests').optional().isArray().withMessage('Interests must be an array')
];

const chatValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('conversationId').optional().isString().withMessage('Conversation ID must be a string')
];

const travelInsightsValidation = [
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('travelMonth').optional().isString().withMessage('Travel month must be a string'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
];

const packingValidation = [
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('travelStyle').optional().isString().withMessage('Travel style must be a string'),
  body('activities').optional().isArray().withMessage('Activities must be an array')
];

// AI Recommendation Routes
router.post('/recommendations', recommendationsValidation, validate, generateRecommendations);
router.post('/generate-itinerary', itineraryValidation, validate, generateItinerary);
router.post('/travel-insights', travelInsightsValidation, validate, getTravelInsights);
router.post('/packing-suggestions', packingValidation, validate, getPackingSuggestions);

// AI Chatbot Routes
router.post('/chat', chatValidation, validate, getChatResponse);
router.get('/chat/history/:conversationId', getChatHistory);
router.post('/smart-answer', getSmartAnswer);

module.exports = router;