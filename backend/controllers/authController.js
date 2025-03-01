const User_Demo = require('../models/users_demo');

const login_demo = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User_Demo.findOne({ username, password });
        if (user) {
            res.status(200).json({ message: `Welcome ${username}` });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login_demo };