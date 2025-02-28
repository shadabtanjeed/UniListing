const mongoose = require('mongoose');

const user_demo_Schema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User_Demo = mongoose.model('users_demos', user_demo_Schema);

module.exports = User_Demo;