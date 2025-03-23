const express = require('express');
const router = express.Router();
const { login_demo, get_username_from_session, logout,signup_demo } = require('../controllers/authController');

router.post('/login', login_demo);

router.get('/session', get_username_from_session);

router.post('/logout', logout);

router.post('/signup',signup_demo);

module.exports = router;