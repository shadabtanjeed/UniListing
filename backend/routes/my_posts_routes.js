const express = require('express');
const router = express.Router();
const myPostsController = require('../controllers/myPostsController');
const authenticateToken = require('../controllers/authMiddleware');

router.get('/all', authenticateToken, myPostsController.getMyPosts);
router.get('/type/:type', authenticateToken, myPostsController.getMyPostsByType);
router.patch('/edit/:postId', authenticateToken, myPostsController.editPost);
router.delete('/delete/:postId', authenticateToken, myPostsController.deletePost);

module.exports = router;