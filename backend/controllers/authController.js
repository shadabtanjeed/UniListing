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

module.exports = { login_demo, get_username_from_session, logout };