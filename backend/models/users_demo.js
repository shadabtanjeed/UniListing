const mongoose = require('mongoose');

const user_demo_Schema = new mongoose.Schema({
    
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Added email field
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash the password
});

const User_Demo = mongoose.model('users_demos', user_demo_Schema);

module.exports = User_Demo;