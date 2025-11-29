const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * POST /api/chat
 * Send message to AI chatbot
 */
router.post('/', chatController.sendMessage);

/**
 * GET /api/chat/history?sessionId=xxx
 * Get conversation history
 */
router.get('/history', chatController.getHistory);

module.exports = router;

