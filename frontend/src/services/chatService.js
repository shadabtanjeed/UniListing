const API_URL = 'http://localhost:5000/api/messages';

// Get all conversations
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

// Get messages for a conversation
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

// Send a message via REST API
export const sendMessage = async (receiverUsername, text, conversationId = null) => {
    try {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                receiver: receiverUsername,
                text,
                conversationId
            }),
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
export const createConversation = async (receiverUsername) => {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                receiver: receiverUsername
            }),
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

// Add this function to the existing service

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