import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  InputAdornment,
  Badge,
  CircularProgress,
  Container,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AppNavbar from '../components/Navbar';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import '../styles/MessagesPageStyle.css';
import { useLocation } from 'react-router-dom';

// Import socket and chat services
import { initSocket, getSocket, disconnectSocket } from '../services/socketService';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
  createConversation,
  searchUsers,
  getImageUrl
} from '../services/chatService';
import { API_BASE_URL } from '../config/api-config';



// Avatar component that uses initials
const UserAvatar = ({ username, online }) => {
  // Get first letter of username
  const initial = username.charAt(0).toUpperCase();

  // Generate a consistent color based on the username
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: online ? '#44b700' : '#bdbdbd',
          border: '2px solid white',
          width: 10,
          height: 10,
          borderRadius: '50%'
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: stringToColor(username),
          width: 50,
          height: 50,
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}
      >
        {initial}
      </Avatar>
    </Badge>
  );
};

// Message bubble component with improved wrapping
const MessageBubble = styled(Paper)(({ theme, sender }) => ({
  padding: '10px 15px',
  borderRadius: sender === 'me' ? '18px 18px 0 18px' : '18px 18px 18px 0',
  backgroundColor: sender === 'me' ? '#2d4f8f' : '#f5f5f5',
  color: sender === 'me' ? 'white' : 'black',
  maxWidth: '100%',
  marginBottom: theme.spacing(1),
  boxShadow: 'none',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto',
  whiteSpace: 'pre-wrap',
  position: 'relative',
}));

const MessagesPage = () => {
  const [currentUsername, setCurrentUsername] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [convLoading, setConvLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchMode, setSearchMode] = useState('conversations'); // 'conversations' or 'users'
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // New state variables for image handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const location = useLocation();

  // Add this function to your component
  const forceScrollToBottom = () => {
    const messagesArea = document.querySelector('.messages-area');
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
      console.log("Force scrolled to bottom:", messagesArea.scrollTop, messagesArea.scrollHeight);
    }
  };

  // Filter conversations based on search query (only in conversations mode)
  const filteredConversations = searchMode === 'conversations'
    ? conversations.filter(chat =>
      chat.otherParticipant.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  // Handle search mode change
  const handleSearchModeChange = (event, newMode) => {
    if (newMode !== null) {
      setSearchMode(newMode);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchMode === 'users' && query.trim() !== '') {
      // Set a timeout to avoid making too many requests while typing
      searchTimeoutRef.current = setTimeout(() => {
        searchForUsers(query);
      }, 300);
    } else if (searchMode === 'users') {
      setSearchResults([]);
    }
  };

  // Search for users
  const searchForUsers = async (query) => {
    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      const users = await searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching for users:', error);
      setError('Failed to search for users');
    } finally {
      setSearchLoading(false);
    }
  };

  // Start a new conversation with a user
  const startConversation = async (username) => {
    try {
      setLoading(true);

      // Check if conversation already exists
      const existingConv = conversations.find(
        conv => conv.otherParticipant === username
      );

      if (existingConv) {
        // If conversation exists, select it
        setSelectedChat(existingConv);
      } else {
        // Create new conversation
        const response = await createConversation(username);

        // Fetch conversations again to get the new one
        await fetchConversations();

        // Find and select the new conversation
        const newConvData = {
          id: response.conversationId,
          otherParticipant: username,
          lastMessage: '',
          timestamp: new Date(),
          unread: 0,
          // Check if user is online
          online: searchResults.find(user => user.username === username)?.online || false
        };

        setSelectedChat(newConvData);
      }

      // Reset search
      setSearchMode('conversations');
      setSearchQuery('');
      setSearchResults([]);

    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, GIF)');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle removing the selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger the hidden file input
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // Initialize and get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        setCurrentUsername(data.username);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setError('Authentication error. Please log in again.');
      }
    };

    fetchCurrentUser();

    // Cleanup function
    return () => {
      disconnectSocket();
    };
  }, []);

  // Initialize socket when username is available
  useEffect(() => {
    if (!currentUsername) return;

    // Initialize socket
    const socket = initSocket(currentUsername);

    // Listen for new messages
    socket.on('new_message', (message) => {
      // If this message is for the current conversation, add it
      if (selectedChat && message.conversationId === selectedChat.id) {
        const formattedMessage = {
          id: message._id,
          sender: message.sender === currentUsername ? 'me' : 'other',
          text: message.text,
          timestamp: message.timestamp,
          hasImage: message.hasImage
        };

        if (message.hasImage && message.image) {
          formattedMessage.image = {
            ...message.image,
            url: message.image.url.startsWith('http')
              ? message.image.url
              : getImageUrl(message._id)
          };
          console.log("New message with image:", formattedMessage.image.url);
        }

        setMessages(prev => [...prev, formattedMessage]);
      }

      // Update conversation list
      setConversations(prev => {
        // Find the conversation
        const convIndex = prev.findIndex(c => c.id === message.conversationId);

        if (convIndex >= 0) {
          // Update existing conversation
          const updatedConversations = [...prev];
          const conv = { ...updatedConversations[convIndex] };

          // Update unread count if it's not the selected chat
          if (!selectedChat || selectedChat.id !== message.conversationId) {
            if (message.sender !== currentUsername) {
              conv.unread = (conv.unread || 0) + 1;
            }
          }

          // Update last message and timestamp
          conv.lastMessage = message.hasImage ? '📷 Image' : message.text;
          conv.timestamp = message.timestamp;

          // Put this conversation at the top
          updatedConversations.splice(convIndex, 1);
          updatedConversations.unshift(conv);

          return updatedConversations;
        } else if (message.sender !== currentUsername) {
          // If it's a new conversation from someone else, add it
          return [{
            id: message.conversationId,
            otherParticipant: message.sender,
            lastMessage: message.hasImage ? '📷 Image' : message.text,
            timestamp: message.timestamp,
            unread: 1,
            online: true // We'll update this with actual status
          }, ...prev];
        }

        return prev;
      });

      // If it's a message from someone else and not in the selected chat,
      // show a notification
      if (message.sender !== currentUsername &&
        (!selectedChat || message.conversationId !== selectedChat.id)) {
        setNotification({
          type: 'message',
          username: message.sender,
          text: message.hasImage ? '📷 Image' : message.text
        });
      }
    });

    // Listen for user status updates
    socket.on('user_status', ({ username, status }) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.otherParticipant === username
            ? { ...conv, online: status === 'online' }
            : conv
        )
      );
    });

    // Listen for typing indicators
    socket.on('user_typing', ({ username, isTyping }) => {
      if (username !== currentUsername) {
        setTypingUsers(prev => ({
          ...prev,
          [username]: isTyping ? new Date() : null
        }));
      }
    });

    // Fetch conversations
    fetchConversations();

    return () => {
      socket.off('new_message');
      socket.off('user_status');
      socket.off('user_typing');
    };
  }, [currentUsername, selectedChat, location.state?.forceRefresh]);

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!currentUsername) return;

    try {
      setConvLoading(true);
      const data = await getConversations();

      // Format conversations
      const formattedConversations = data.map(conv => ({
        id: conv.id,
        otherParticipant: conv.otherParticipant,
        lastMessage: conv.lastMessage,
        timestamp: conv.timestamp,
        unread: conv.unread,
        online: conv.online
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setConvLoading(false);
    }
  };

  useEffect(() => {
    // Fetch conversations on mount and when page becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchConversations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Initial fetch
    fetchConversations();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUsername, location.state?.forceRefresh]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const data = await getMessages(conversationId);

      // Format messages
      const formattedMessages = data.map(msg => {
        const formatted = {
          id: msg.id,
          sender: msg.sender === currentUsername ? 'me' : 'other',
          text: msg.text,
          timestamp: msg.timestamp,
          read: msg.read,
          hasImage: msg.hasImage
        };

        // Make sure to properly set the image URL if there is an image
        if (msg.hasImage && msg.image) {
          formatted.image = {
            ...msg.image,
            url: msg.image.url.startsWith('http') ? msg.image.url : getImageUrl(msg.id)
          };
          console.log("Image URL for message:", msg.id, formatted.image.url);
        }

        return formatted;
      });

      setMessages(formattedMessages);

      setTimeout(forceScrollToBottom, 200);

      // Mark messages as read
      await markMessagesAsRead(conversationId);

      // Update unread count in conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Replace your existing scroll useEffect with this:
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        // Use scrollIntoView with a clearer behavior setting
        try {
          messagesEndRef.current.scrollIntoView({ block: 'end', inline: 'nearest' });
        } catch (error) {
          console.error("Scroll error:", error);
          // Fallback method
          const messagesArea = document.querySelector('.messages-area');
          if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }
        }
      } else {
        console.log("messagesEndRef not attached");
      }
    };

    // Try multiple times with increasing delays to ensure scroll works
    scrollToBottom();
    const timeouts = [
      setTimeout(scrollToBottom, 100),
      setTimeout(scrollToBottom, 300),
      setTimeout(scrollToBottom, 500)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [messages, selectedChat]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedChat) return;

    const socket = getSocket();

    // Send typing indicator
    socket.emit('typing', {
      conversationId: selectedChat.id,
      username: currentUsername,
      isTyping: true
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: selectedChat.id,
        username: currentUsername,
        isTyping: false
      });
    }, 2000); // Stop typing indicator after 2 seconds of inactivity
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedChat || !currentUsername) return;

    try {
      // Use the socket to send the message
      const socket = getSocket();

      let imageData = null;

      // If we have an image, prepare it for sending
      if (selectedImage) {
        const reader = new FileReader();

        // Convert image to base64
        const imagePromise = new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64data = reader.result;
            const imageContentType = selectedImage.type;
            const imageFileName = selectedImage.name;

            // Extract the base64 data (remove the prefix)
            const base64Content = base64data.split(',')[1];

            resolve({
              data: base64Content,
              contentType: imageContentType,
              fileName: imageFileName
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });

        imageData = await imagePromise;
      }

      // Send the message with image if present
      socket.emit('send_message', {
        sender: currentUsername,
        receiver: selectedChat.otherParticipant,
        text: newMessage,
        conversationId: selectedChat.id,
        image: imageData
      });

      // Clear the message input and selected image
      setNewMessage('');
      handleRemoveImage();

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socket.emit('typing', {
        conversationId: selectedChat.id,
        username: currentUsername,
        isTyping: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Select a chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);

    // If there are unread messages, mark them as read
    if (chat.unread > 0) {
      markMessagesAsRead(chat.id);

      // Update unread count in UI immediately
      setConversations(prev =>
        prev.map(conv =>
          conv.id === chat.id
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Format time to show hours and minutes
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If today, return time only
    if (date.toDateString() === now.toDateString()) {
      return timeString;
    }

    // If this year, return month and day with time
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeString}`;
    }

    // Otherwise, return full date with time
    return `${date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}, ${timeString}`;
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <AppNavbar />
      <Box className="content messages-content">
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper className="messages-container">
            {/* Left sidebar - Conversation list */}
            <Box className="conversations-sidebar">
              <Box className="conversations-header">
                <Typography variant="h6">Messages</Typography>

                {/* Search toggle */}
                <ToggleButtonGroup
                  value={searchMode}
                  exclusive
                  onChange={handleSearchModeChange}
                  aria-label="search mode"
                  size="small"
                  sx={{ width: '100%', mt: 2, mb: 1 }}
                >
                  <ToggleButton value="conversations" aria-label="search conversations">
                    <MessageIcon sx={{ mr: 1 }} fontSize="small" />
                    Conversations
                  </ToggleButton>
                  <ToggleButton value="users" aria-label="search users">
                    <GroupIcon sx={{ mr: 1 }} fontSize="small" />
                    Find Users
                  </ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  placeholder={searchMode === 'conversations' ? "Search conversations" : "Search for users"}
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>

              <List className="conversations-list">
                {/* Show different content based on search mode */}
                {searchMode === 'conversations' ? (
                  // Conversations list
                  convLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : filteredConversations.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No conversations found
                      </Typography>
                    </Box>
                  ) : (
                    filteredConversations.map((chat) => (
                      <React.Fragment key={chat.id}>
                        <ListItem
                          button
                          className={`conversation-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                          onClick={() => handleSelectChat(chat)}
                        >
                          <ListItemAvatar>
                            <UserAvatar
                              username={chat.otherParticipant}
                              online={chat.online}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between">
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={chat.unread > 0 ? 'bold' : 'normal'}
                                >
                                  {chat.otherParticipant}
                                </Typography>
                                {chat.timestamp && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(chat.timestamp).split(',')[0]}
                                  </Typography>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                  sx={{
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '180px',
                                    fontWeight: chat.unread > 0 ? 'bold' : 'normal'
                                  }}
                                >
                                  {chat.lastMessage || 'Start a conversation'}
                                </Typography>
                                {chat.unread > 0 && (
                                  <Badge badgeContent={chat.unread} color="primary" />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))
                  )
                ) : (
                  // User search results
                  searchLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : searchQuery.trim() === '' ? (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        Type to search for users
                      </Typography>
                    </Box>
                  ) : searchResults.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No users found matching "{searchQuery}"
                      </Typography>
                    </Box>
                  ) : (
                    searchResults.map((user) => (
                      <React.Fragment key={user.username}>
                        <ListItem
                          button
                          className="user-search-item"
                          onClick={() => startConversation(user.username)}
                        >
                          <ListItemAvatar>
                            <UserAvatar
                              username={user.username}
                              online={user.online}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                {user.username}
                              </Typography>
                            }
                            secondary={
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mr: 1 }}
                                >
                                  {user.online ? 'Online' : 'Offline'}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<PersonAddIcon />}
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startConversation(user.username);
                                  }}
                                  sx={{ ml: 'auto' }}
                                >
                                  Message
                                </Button>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))
                  )
                )}
              </List>
            </Box>

            {/* Right section - Chat view */}
            <Box className="chat-view">
              {selectedChat ? (
                <>
                  {/* Chat header */}
                  <Box className="chat-header">
                    <Box display="flex" alignItems="center">
                      <UserAvatar
                        username={selectedChat.otherParticipant}
                        online={selectedChat.online}
                      />
                      <Box ml={2}>
                        <Typography variant="h6">{selectedChat.otherParticipant}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedChat.online ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Messages area */}
                  <Box className="messages-area">
                    {loading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">
                          No messages yet. Start a conversation!
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {messages.map((message) => (
                          message.sender === 'me' ? (
                            // Sent message - right aligned
                            <Box key={message.id} sx={{ width: '100%', mb: 3 }}>
                              {/* Timestamp */}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  textAlign: 'right',
                                  mb: 0.5,
                                  mr: 1
                                }}
                              >
                                {formatDate(message.timestamp)}
                              </Typography>

                              {/* Message bubble - right aligned */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  pr: 1,
                                  flexDirection: 'column',
                                  alignItems: 'flex-end'
                                }}
                              >
                                <Box sx={{ maxWidth: '70%' }}>
                                  {message.text && (
                                    <MessageBubble sender="me">
                                      {message.text}
                                    </MessageBubble>
                                  )}

                                  {message.hasImage && (
                                    <Box sx={{
                                      mt: message.text ? 1 : 0,
                                      maxWidth: '300px',
                                      borderRadius: '8px',
                                      overflow: 'hidden'
                                    }}>
                                      <img
                                        src={message.image.url}
                                        alt="Message attachment"
                                        style={{
                                          width: '100%',
                                          display: 'block'
                                        }}
                                        loading="lazy"
                                        onError={(e) => {
                                          console.error("Image failed to load:", message.image.url);
                                          e.target.onerror = null; // Prevent infinite loops
                                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='16' fill='%23999'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            // Received message - left aligned
                            <Box key={message.id} sx={{ width: '100%', mb: 3 }}>
                              {/* Timestamp */}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  textAlign: 'left',
                                  mb: 0.5,
                                  ml: 1
                                }}
                              >
                                {formatDate(message.timestamp)}
                              </Typography>

                              {/* Message bubble with avatar - left aligned */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  pl: 1
                                }}
                              >
                                <Box sx={{ mr: 1 }}>
                                  <UserAvatar
                                    username={selectedChat.otherParticipant}
                                    online={selectedChat.online}
                                  />
                                </Box>
                                <Box sx={{ maxWidth: '70%' }}>
                                  {message.text && (
                                    <MessageBubble sender="other">
                                      {message.text}
                                    </MessageBubble>
                                  )}

                                  {message.hasImage && (
                                    <Box sx={{
                                      mt: message.text ? 1 : 0,
                                      maxWidth: '300px',
                                      borderRadius: '8px',
                                      overflow: 'hidden'
                                    }}>
                                      <img
                                        src={message.image.url}
                                        alt="Message attachment"
                                        style={{
                                          width: '100%',
                                          display: 'block'
                                        }}
                                        loading="lazy"
                                      />
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          )
                        ))}

                        {/* Typing indicator */}
                        {typingUsers[selectedChat.otherParticipant] && (
                          <Box sx={{ display: 'flex', pl: 1, mb: 2 }}>
                            <Box sx={{ mr: 1 }}>
                              <UserAvatar
                                username={selectedChat.otherParticipant}
                                online={selectedChat.online}
                              />
                            </Box>
                            <Box
                              sx={{
                                backgroundColor: '#f5f5f5',
                                padding: '8px 16px',
                                borderRadius: '18px',
                                width: 'fit-content'
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Typing...
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Make sure this is at the VERY END of your messages list */}
                        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }}></div>
                      </>
                    )}
                  </Box>

                  {/* Image preview area */}
                  {imagePreview && (
                    <Box
                      sx={{
                        p: 2,
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: 'hidden',
                          mr: 2
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)',
                            },
                            p: 0.5
                          }}
                          onClick={handleRemoveImage}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedImage?.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Message input */}
                  <Box className="message-input-area">
                    <form onSubmit={handleSendMessage} className="message-form">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleImageSelect}
                      />

                      <TextField
                        placeholder="Type a message..."
                        variant="outlined"
                        fullWidth
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        disabled={!currentUsername}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton
                                color="primary"
                                onClick={handleAttachClick}
                                disabled={!currentUsername}
                                size="small"
                              >
                                <ImageIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="submit"
                                color="primary"
                                disabled={(newMessage.trim() === '' && !selectedImage) || !currentUsername}
                              >
                                <SendIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </form>
                  </Box>
                </>
              ) : (
                <Box className="no-chat-selected" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No conversation selected
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select a conversation from the list or search for users to start chatting
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Notification snackbar */}
          <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
              <Typography variant="subtitle2">
                {notification?.username}
              </Typography>
              <Typography variant="body2">
                {notification?.text}
              </Typography>
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default MessagesPage;