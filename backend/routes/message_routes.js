const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Existing routes
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:conversationId', chatController.getConversationMessages);
router.post('/send', chatController.sendMessage);
router.post('/read/:conversationId', chatController.markAsRead);
router.post('/conversations', chatController.createConversation);
router.get('/search-users', chatController.searchUsers);

// Add a new route for fetching message images
router.get('/image/:messageId', chatController.getMessageImage);

module.exports = router;