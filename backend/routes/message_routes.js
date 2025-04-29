const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../controllers/authMiddleware');

// Existing routes
router.get('/conversations', authenticateToken, chatController.getUserConversations);
router.get('/conversations/:conversationId', authenticateToken, chatController.getConversationMessages);
router.post('/send', authenticateToken, chatController.sendMessage);
router.post('/read/:conversationId', authenticateToken, chatController.markAsRead);
router.post('/conversations', authenticateToken, chatController.createConversation);
router.get('/search-users', authenticateToken, chatController.searchUsers);

// Add a new route for fetching message images
router.get('/image/:messageId', authenticateToken, chatController.getMessageImage);

module.exports = router;