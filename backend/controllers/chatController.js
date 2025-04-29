const Conversation = require('../models/conversation_model');
const Message = require('../models/message_model');
const User_Demo = require('../models/users_demo');
const multer = require('multer');
const path = require('path');



// Store connected users
const connectedUsers = new Map();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Setup socket connection for a user
const setupSocket = (socket, io) => {
    // Authenticate user from session
    socket.on('authenticate', async (username) => {
        // Associate socket id with username
        connectedUsers.set(username, socket.id);

        // Join rooms for all user's conversations
        const conversations = await Conversation.find({
            participants: username
        });

        conversations.forEach(conv => {
            socket.join(conv._id.toString());
        });

        // Broadcast user's online status
        io.emit('user_status', { username, status: 'online' });

        console.log(`User ${username} authenticated with socket ${socket.id}`);
    });

    // Handle new message with image support
    // Update the socket handler for send_message to properly handle images
    socket.on('send_message', async (messageData) => {
        try {
            const { sender, receiver, text, conversationId, image } = messageData;

            // If no conversation ID, create a new conversation
            let convId = conversationId;
            if (!convId) {
                const newConv = new Conversation({
                    participants: [sender, receiver],
                    lastMessage: image ? '📷 Image' : text,
                    lastMessageTimestamp: new Date(),
                    unreadCount: new Map([[receiver, 1]])
                });

                const savedConv = await newConv.save();
                convId = savedConv._id;

                // Join the room
                socket.join(convId.toString());

                // If receiver is online, add them to the room
                const receiverSocketId = connectedUsers.get(receiver);
                if (receiverSocketId) {
                    io.sockets.sockets.get(receiverSocketId)?.join(convId.toString());
                }
            } else {
                // Update existing conversation
                await Conversation.findByIdAndUpdate(convId, {
                    lastMessage: image ? '📷 Image' : text,
                    lastMessageTimestamp: new Date(),
                    $inc: { [`unreadCount.${receiver}`]: 1 }
                });
            }

            // Create new message
            const message = new Message({
                conversationId: convId,
                sender,
                receiver,
                text: text || '',
                hasImage: !!image,
                timestamp: new Date(),
                read: false
            });

            // If there's an image, add it to the message
            if (image) {
                message.image = {
                    data: Buffer.from(image.data, 'base64'),
                    contentType: image.contentType,
                    originalName: image.fileName
                };
            }

            const savedMessage = await message.save();

            // Create a modified version of the message to send to clients
            // We don't want to send the full image data through socket.io
            const messageForClient = {
                ...savedMessage.toObject(),
                _id: savedMessage._id, // Make sure we have the _id field
                conversationId: convId
            };

            // If there's an image, replace the data with a URL
            if (savedMessage.hasImage) {
                // Use absolute URL for better compatibility
                const host = socket.request.headers.host || 'localhost:5000';
                const protocol = socket.request.headers['x-forwarded-proto'] || 'http';

                messageForClient.image = {
                    url: `${protocol}://${host}/api/messages/image/${savedMessage._id}`,
                    contentType: savedMessage.image.contentType,
                    originalName: savedMessage.image.originalName
                };
                delete messageForClient.image.data; // Don't send the binary data
            }

            // Debug the message
            console.log('Sending message to clients:', {
                id: messageForClient._id,
                hasImage: messageForClient.hasImage,
                imageUrl: messageForClient.hasImage ? messageForClient.image.url : null
            });

            // Broadcast to the conversation room
            io.to(convId.toString()).emit('new_message', messageForClient);

            // Send notification to receiver if online
            const receiverSocketId = connectedUsers.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message_notification', {
                    conversationId: convId,
                    message: messageForClient,
                    sender
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Add the getMessageImage function to properly serve image data
    const getMessageImage = async (req, res) => {
        try {
            const { messageId } = req.params;
            // Get username from token in cookies
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            // Verify the token
            const decoded = jwt.verify(token, JWT_SECRET);
            const username = decoded.username;

            if (!username) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            console.log(`Fetching image for message ${messageId} by user ${username}`);

            // Find the message
            const message = await Message.findById(messageId);
            if (!message) {
                console.error('Message not found:', messageId);
                return res.status(404).json({ message: 'Message not found' });
            }

            // Check if user is part of this conversation
            const conversation = await Conversation.findById(message.conversationId);
            if (!conversation) {
                console.error('Conversation not found for message:', messageId);
                return res.status(404).json({ message: 'Conversation not found' });
            }

            if (!conversation.participants.includes(username)) {
                console.error('Access denied to image for user', username);
                return res.status(403).json({ message: 'Access denied to this image' });
            }

            // Check if message has an image
            if (!message.hasImage || !message.image || !message.image.data) {
                console.error('No image data found for message:', messageId);
                return res.status(404).json({ message: 'No image found' });
            }

            // Set content type and send image data
            console.log('Serving image of type:', message.image.contentType);

            res.set('Content-Type', message.image.contentType);
            res.set('Cache-Control', 'public, max-age=31557600'); // Cache for a year
            return res.send(message.image.data);

        } catch (error) {
            console.error('Error fetching image:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // Handle typing indicator
    socket.on('typing', ({ conversationId, username, isTyping }) => {
        socket.to(conversationId).emit('user_typing', { username, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        // Find and remove user from connectedUsers
        for (const [username, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(username);
                io.emit('user_status', { username, status: 'offline' });
                break;
            }
        }
    });
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
    try {
        const token = req.cookies.token; // Get the token from cookies
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const conversations = await Conversation.find({
            participants: username
        }).sort({ lastMessageTimestamp: -1 });

        // Get the other participant for each conversation
        const conversationsWithDetails = await Promise.all(conversations.map(async conv => {
            const otherParticipant = conv.participants.find(p => p !== username);

            // Get unread count for current user
            const unreadCount = conv.unreadCount.get(username) || 0;

            // Check if other user is online
            const isOnline = connectedUsers.has(otherParticipant);

            return {
                id: conv._id,
                otherParticipant,
                lastMessage: conv.lastMessage,
                timestamp: conv.lastMessageTimestamp,
                unread: unreadCount,
                online: isOnline
            };
        }));

        res.json(conversationsWithDetails);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update the getConversationMessages function to include proper image URLs
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        // Get username from token in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Check if user is part of this conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(username)) {
            return res.status(403).json({ message: 'Access denied to this conversation' });
        }

        // Get messages
        const messages = await Message.find({ conversationId })
            .sort({ timestamp: 1 });

        // Format messages for client
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol || 'http';

        const formattedMessages = messages.map(msg => {
            const formattedMsg = {
                id: msg._id,
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp,
                read: msg.read,
                hasImage: msg.hasImage
            };

            if (msg.hasImage) {
                formattedMsg.image = {
                    url: `${protocol}://${host}/api/messages/image/${msg._id}`,
                    contentType: msg.image.contentType,
                    originalName: msg.image.originalName
                };
            }

            return formattedMsg;
        });

        res.json(formattedMessages);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Send a new message
const sendMessage = async (req, res) => {
    try {
        const { receiver, text, conversationId } = req.body;
        // Get sender from token in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const sender = decoded.username;

        if (!sender) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // If no conversation ID provided, create new conversation
        let convId = conversationId;
        if (!convId) {
            const newConv = new Conversation({
                participants: [sender, receiver],
                lastMessage: text,
                lastMessageTimestamp: new Date(),
                unreadCount: new Map([[receiver, 1]])
            });

            const savedConv = await newConv.save();
            convId = savedConv._id;
        } else {
            // Update existing conversation
            await Conversation.findByIdAndUpdate(convId, {
                lastMessage: text,
                lastMessageTimestamp: new Date(),
                $inc: { [`unreadCount.${receiver}`]: 1 }
            });
        }

        // Create new message
        const message = new Message({
            conversationId: convId,
            sender,
            receiver,
            text,
            timestamp: new Date(),
            read: false
        });

        const savedMessage = await message.save();

        res.status(201).json({
            message: savedMessage,
            conversationId: convId
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        // Get username from token in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Mark all messages as read where user is the receiver
        await Message.updateMany(
            {
                conversationId,
                receiver: username,
                read: false
            },
            { read: true }
        );

        // Reset unread count
        await Conversation.findByIdAndUpdate(
            conversationId,
            { $set: { [`unreadCount.${username}`]: 0 } }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { receiver } = req.body;
        const token = req.cookies.token; // Get the token from cookies

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const sender = decoded.username;

        if (!sender) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Check if conversation already exists
        const existingConv = await Conversation.findOne({
            participants: { $all: [sender, receiver] }
        });

        if (existingConv) {
            return res.json({ conversationId: existingConv._id });
        }

        // Create new conversation
        const newConv = new Conversation({
            participants: [sender, receiver],
            lastMessage: '',
            lastMessageTimestamp: new Date(),
            unreadCount: new Map()
        });

        const savedConv = await newConv.save();

        res.status(201).json({ conversationId: savedConv._id });

    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search for users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const token = req.cookies.token; // Get the token from cookies

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUsername = decoded.username;

        if (!currentUsername) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!query || query.trim() === '') {
            return res.json([]);
        }

        // Search for users in the database that match the query
        // Exclude the current user from results
        const users = await User_Demo.find({
            username: {
                $regex: query,
                $options: 'i',  // case-insensitive
                $ne: currentUsername // not equal to current user
            }
        }).select('username').limit(10);

        // Format and return the users
        const formattedUsers = users.map(user => ({
            username: user.username,
            // Get online status from connected users map
            online: connectedUsers.has(user.username)
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get image content
const getMessageImage = async (req, res) => {
    try {
        const { messageId } = req.params;
        // Get username from token in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        if (!username) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Find the message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is part of this conversation
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation || !conversation.participants.includes(username)) {
            return res.status(403).json({ message: 'Access denied to this image' });
        }

        // Check if message has an image
        if (!message.hasImage || !message.image || !message.image.data) {
            return res.status(404).json({ message: 'No image found' });
        }

        // Set content type and send image data
        res.contentType(message.image.contentType);
        res.send(message.image.data);

    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Don't forget to include getMessageImage in the module.exports
module.exports = {
    setupSocket,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    createConversation,
    searchUsers,
    getMessageImage
};