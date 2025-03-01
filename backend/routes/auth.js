const express = require('express');
const router = express.Router();
const { login_demo, get_username_from_session, logout } = require('../controllers/authController');

router.post('/login', login_demo);

router.get('/session', get_username_from_session);

router.post('/logout', logout);

module.exports = router;