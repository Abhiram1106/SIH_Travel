const express = require('express');
const { body } = require('express-validator');
const {
  getChatResponse,
  getChatHistory,
  getSmartAnswer
} = require('../controllers/aiChatbotController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All chatbot routes require authentication
router.use(auth);

// Validation rules
const chatValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('conversationId').optional().isString().withMessage('Conversation ID must be a string'),
  body('userId').optional().isString().withMessage('User ID must be a string')
];

const smartAnswerValidation = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('destination').optional().trim().isString().withMessage('Destination must be a string'),
  body('context').optional().isString().withMessage('Context must be a string')
];

// Routes
router.post('/chat', chatValidation, validate, getChatResponse);
router.get('/history/:conversationId', getChatHistory);
router.post('/smart-answer', smartAnswerValidation, validate, getSmartAnswer);

module.exports = router;
