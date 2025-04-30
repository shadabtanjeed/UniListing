const express = require('express');
const router = express.Router();
const savedPostsController = require('../controllers/savedPostsController');
const authenticateToken = require('../controllers/authMiddleware');

router.post('/save', authenticateToken, savedPostsController.savePost);
router.delete('/unsave/:postId', authenticateToken, savedPostsController.unsavePost);
router.get('/all', authenticateToken, savedPostsController.getSavedPosts);
router.get('/type/:type', authenticateToken, savedPostsController.getSavedPostsByType);
router.get('/check/:type/:id', authenticateToken, savedPostsController.checkIfSaved);

module.exports = router;