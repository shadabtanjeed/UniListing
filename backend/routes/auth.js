const express = require('express');
const router = express.Router();
const { login_demo } = require('../controllers/authController');

router.post('/login', login_demo);

router.get('/session', (req, res) => {
    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;