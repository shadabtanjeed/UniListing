const User_Demo = require('../models/users_demo');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with a secure key in production

// Login
const login_demo = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User_Demo.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Set the token as an httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
        });

        res.status(200).json({ message: `Welcome ${username}` });

    } catch (error) {
        console.error('Error in login_demo:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Signup
const signup_demo = async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the email or username already exists
        const existingUser = await User_Demo.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User_Demo({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword, // Save the hashed password
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        // Set the token as an httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in signup_demo:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout
const logout = async (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
};

const get_session = async (req, res) => {
    try {
        const token = req.cookies.token; // Get the token from cookies
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ username: decoded.username });
    } catch (error) {
        console.error('Error in get_session:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { login_demo, signup_demo, logout, get_session };

