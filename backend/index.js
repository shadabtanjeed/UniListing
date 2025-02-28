const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
require('dotenv').config();


const mongoose = require('mongoose');

mongoose.connect(process.env.mongodb_url);

app.use(cors());
app.use(bodyParser.json());

const Test = require('./models/test_model');
const User_Demo = require('./models/users_demo');

// add data to User_Demo
// function addUserData() {
//     const user_demo = new User_Demo({
//         username: 'faraiba',
//         password: 'faraiba'
//     });
//     user_demo.save();
// }

// addUserData();

app.get('/tests', async (req, res) => {
    const tests = await Test.find();
    res.json(tests);
});

app.post('/tests', async (req, res) => {
    const { name, age } = req.body;
    const test = new Test({ name, age });
    await test.save();
    res.status(201).json(test);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});