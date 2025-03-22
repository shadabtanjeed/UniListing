const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Existing routes
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:conversationId', chatController.getConversationMessages);
router.post('/send', chatController.sendMessage);
router.post('/read/:conversationId', chatController.markAsRead);
router.post('/conversations', chatController.createConversation);

// Add this new route
router.get('/search-users', chatController.searchUsers);

module.exports = router;