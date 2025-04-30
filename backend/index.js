const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = 5000;
require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.mongodb_url);

// Add or update the express middleware setup:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS with updated settings for Socket.IO
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
// Increase the payload size limit
app.use(bodyParser.json({ limit: '10mb' })); // Adjust '10mb' as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Import routes and models
const authRoutes = require('./routes/auth');
const apartmentRoutes = require('./routes/apartment_routes');
const messageRoutes = require('./routes/message_routes');
const itemRoutes = require('./routes/item_routes');
const chatController = require('./controllers/chatController');
const savedPostsRoutes = require('./routes/saved_posts_routes');
const myPostsRoutes = require('./routes/my_posts_routes');
const otpRoutes = require('./routes/otp_routes');


app.use('/auth', authRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/saved-posts', savedPostsRoutes);
app.use('/api/my_posts', myPostsRoutes);
app.use('/api/otp', otpRoutes);

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Setup socket handlers from controller
    chatController.setupSocket(socket, io);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Use server.listen instead of app.listen for Socket.IO to work
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});