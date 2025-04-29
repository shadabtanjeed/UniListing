import { API_BASE_URL } from '../config/api-config';

const API_URL = `${API_BASE_URL}/api/messages`;

// Get all conversations for current user
export const getConversations = async () => {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId) => {
    try {
        const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// Send a message
export const sendMessage = async (receiver, text, conversationId = null) => {
    try {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                receiver,
                text,
                conversationId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
    try {
        const response = await fetch(`${API_URL}/read/${conversationId}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to mark messages as read');
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

// Create a new conversation
export const createConversation = async (receiver) => {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                receiver
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

// Search for users
export const searchUsers = async (query) => {
    try {
        const response = await fetch(`${API_URL}/search-users?query=${encodeURIComponent(query)}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to search users');
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

// Get image URL for a message - use absolute URL for images
export const getImageUrl = (messageId) => {
    return `${API_BASE_URL}/api/messages/image/${messageId}`;
};