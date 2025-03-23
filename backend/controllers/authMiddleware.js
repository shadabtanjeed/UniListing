const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the decoded token data to the request object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;