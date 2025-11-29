const chatService = require('../services/aiChatService');

/**
 * POST /api/chat
 * Send message to AI chatbot
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, language = 'en', anonymousId } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ 
        message: 'sessionId and message are required' 
      });
    }

    const result = await chatService.sendMessage(sessionId, message, language, anonymousId);
    return res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      message: 'Error processing chat message',
      error: error.message 
    });
  }
};

/**
 * GET /api/chat/history?sessionId=xxx
 * Get conversation history
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const messages = await chatService.getConversationHistory(sessionId);
    return res.json({ messages });
  } catch (error) {
    console.error('Error getting history:', error);
    return res.status(500).json({ message: 'Error retrieving history' });
  }
};

