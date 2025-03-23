const express = require('express');
const router = express.Router();
const { login_demo, signup_demo, logout,get_session } = require('../controllers/authController');
const authenticateToken = require('../controllers/authMiddleware');

router.post('/login', login_demo);
router.post('/signup', signup_demo);
router.post('/logout', logout);
router.get('/session', get_session);

// Example of a protected route
router.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: `Hello, ${req.user.username}! This is a protected route.` });
});

module.exports = router;