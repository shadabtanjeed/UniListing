const Conversation = require('../models/conversation_model');
const Message = require('../models/message_model');
const User_Demo = require('../models/users_demo');

// Store connected users
const connectedUsers = new Map();

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

    // Handle new message
    socket.on('send_message', async (messageData) => {
        try {
            const { sender, receiver, text, conversationId } = messageData;

            // If no conversation ID, create a new conversation
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

            // Broadcast to the conversation room
            io.to(convId.toString()).emit('new_message', {
                ...savedMessage.toObject(),
                conversationId: convId
            });

            // Send notification to receiver if online
            const receiverSocketId = connectedUsers.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message_notification', {
                    conversationId: convId,
                    message: savedMessage,
                    sender
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

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
        const username = req.session.username;
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

// Get messages for a specific conversation
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const username = req.session.username;

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
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
            read: msg.read
        }));

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
        const sender = req.session.username;

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
        const username = req.session.username;

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
        const sender = req.session.username;

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
        const currentUsername = req.session.username;

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

// Add searchUsers to module.exports
module.exports = {
    setupSocket,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markAsRead,
    createConversation,
    searchUsers
};