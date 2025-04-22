const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// Routes for chat functionality
router.post('/init', chatController.initChat);
router.post('/send', chatController.sendMessage);
router.get('/history/:sessionId', chatController.getChatHistory);
router.get('/medical-history', authenticateToken, chatController.getMedicalHistory);
router.get('/sessions', authenticateToken, chatController.getUserSessions);
router.post('/booking-sms', authenticateToken, chatController.sendBookingSMS);

module.exports = router;
