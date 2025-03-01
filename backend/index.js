const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = 5000;
require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.mongodb_url);

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use(bodyParser.json());

// Configure session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.mongodb_url,
        ttl: 18000 // 1 hour
    }),
    cookie: { maxAge: 18000000 } // 1 hour
}));

const Test = require('./models/test_model');
const User_Demo = require('./models/users_demo');

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});