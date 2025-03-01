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

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});