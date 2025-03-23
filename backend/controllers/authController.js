const User_Demo = require('../models/users_demo');

const login_demo = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User_Demo.findOne({ username, password });
        if (user) {
            req.session.username = username;
            res.status(200).json({ message: `Welcome ${username}` });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const get_username_from_session = async (req, res) => {
    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to logout' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

const signup_demo = async (req, res) => {
    console.log('Signup endpoint hit with data:', req.body);
    const { firstName, lastName, email, username, password } = req.body;
    // Validate input
    if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the email or username already exists
        const existingUser = await User_Demo.findOne({ $or: [{ username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists' });
        }

        // Create a new user
        const newUser = new User_Demo({
            firstName,
            lastName,
            email,
            username,
            password, // In production, hash the password before saving
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login_demo, get_username_from_session, logout, signup_demo };