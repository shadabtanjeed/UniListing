const express = require('express');
const router = express.Router();
const { login_demo } = require('../controllers/authController');

router.post('/login', login_demo);

module.exports = router;