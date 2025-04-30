const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, completeRegistration, resendOTP } = require('../controllers/otpController');

router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.post('/complete-registration', completeRegistration);
router.post('/resend', resendOTP);

module.exports = router;