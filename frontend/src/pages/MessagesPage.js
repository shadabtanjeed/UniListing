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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AppSidebar from '../components/Sidebar';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/MessagesPageStyle.css';

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

// Dummy chat data - includes both conversations and all users
const dummyChats = [
  {
    id: 1,
    username: 'Shadab Tanjeed',
    lastMessage: 'Is the apartment still available?',
    timestamp: '2023-07-28T14:30:00',
    unread: 2,
    online: true
  },
  {
    id: 2,
    username: 'Mosharraf Karim',
    lastMessage: 'I\'m interested in your apartment listing',
    timestamp: '2023-07-27T09:15:00',
    unread: 0,
    online: false
  },
  {
    id: 3,
    username: 'Anannyo Ahmed',
    lastMessage: 'When can I visit to see the place?',
    timestamp: '2023-07-26T18:45:00',
    unread: 3,
    online: true
  },
  {
    id: 4,
    username: 'Rifat Zaman',
    lastMessage: 'Thanks for the information!',
    timestamp: '2023-07-25T11:20:00',
    unread: 0,
    online: false
  },
  {
    id: 5,
    username: 'Luna Ahmed',
    lastMessage: 'Is utilities included in the rent?',
    timestamp: '2023-07-24T16:05:00',
    unread: 1,
    online: true
  },
  // Add users that don't have conversations yet
  {
    id: 6,
    username: 'Tahsin Islam',
    lastMessage: '',
    timestamp: '',
    unread: 0,
    online: true,
    noConversation: true
  },
  {
    id: 7,
    username: 'Safwan Sakib',
    lastMessage: '',
    timestamp: '',
    unread: 0,
    online: false,
    noConversation: true
  },
  {
    id: 8,
    username: 'Ashrafi Mahmud',
    lastMessage: '',
    timestamp: '',
    unread: 0,
    online: true,
    noConversation: true
  },
  {
    id: 9,
    username: 'Pranto Roy',
    lastMessage: '',
    timestamp: '',
    unread: 0,
    online: false,
    noConversation: true
  },
  {
    id: 10,
    username: 'Farhan Abir',
    lastMessage: '',
    timestamp: '',
    unread: 0,
    online: true,
    noConversation: true
  },
];

const dummyMessages = {
  1: [
    { id: 1, sender: 'other', text: 'Hello, I saw your apartment listing in Lalmatia.', timestamp: '2023-07-28T14:25:00' },
    { id: 2, sender: 'other', text: 'Is the apartment still available?', timestamp: '2023-07-28T14:26:00' },
    { id: 3, sender: 'me', text: 'Hi there! Yes, it is still available.', timestamp: '2023-07-28T14:27:00' },
    { id: 4, sender: 'me', text: 'Would you like to schedule a viewing?', timestamp: '2023-07-28T14:28:00' },
    { id: 5, sender: 'other', text: 'That would be great! When would be a good time?', timestamp: '2023-07-28T14:29:00' },
  ],
  2: [
    { id: 1, sender: 'other', text: 'Hello, I\'m looking for an apartment near Mohammadpur', timestamp: '2023-07-27T09:10:00' },
    { id: 2, sender: 'me', text: 'Hi! I have a listing in that area.', timestamp: '2023-07-27T09:12:00' },
    { id: 3, sender: 'other', text: 'I\'m interested in your apartment listing', timestamp: '2023-07-27T09:15:00' },
  ],
  3: [
    { id: 1, sender: 'other', text: 'Is the apartment pet-friendly?', timestamp: '2023-07-26T18:40:00' },
    { id: 2, sender: 'me', text: 'Yes, small pets are allowed.', timestamp: '2023-07-26T18:42:00' },
    { id: 3, sender: 'other', text: 'Great! When can I visit to see the place?', timestamp: '2023-07-26T18:45:00' },
  ],
  4: [
    { id: 1, sender: 'other', text: 'How much is the rent?', timestamp: '2023-07-25T11:10:00' },
    { id: 2, sender: 'me', text: 'The rent is 25,000 BDT per month including utilities.', timestamp: '2023-07-25T11:15:00' },
    { id: 3, sender: 'other', text: 'Thanks for the information!', timestamp: '2023-07-25T11:20:00' },
  ],
  5: [
    { id: 1, sender: 'other', text: 'Hi, I\'m interested in your apartment listing.', timestamp: '2023-07-24T16:00:00' },
    { id: 2, sender: 'me', text: 'Hello! What would you like to know?', timestamp: '2023-07-24T16:02:00' },
    { id: 3, sender: 'other', text: 'Is utilities included in the rent?', timestamp: '2023-07-24T16:05:00' },
  ],
};

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Filter chats based on search query
  const filteredChats = dummyChats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Simulate loading messages
    if (selectedChat) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMessages(dummyMessages[selectedChat.id] || []);
        setLoading(false);
      }, 500);
    }
  }, [selectedChat]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedChat) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleStartNewChat = (chat) => {
    setSelectedChat(chat);

    if (chat.noConversation) {
      // For demo purposes, we'll pretend this user is now the selected chat
      setMessages([]);
    }
  };

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

  return (
    <>
      <AppSidebar />
      <Box className="content messages-content">
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Paper className="messages-container">
            {/* Left sidebar - Conversation list */}
            <Box className="conversations-sidebar">
              <Box className="conversations-header">
                <Typography variant="h6">Messages</Typography>
                <TextField
                  placeholder="Search users and conversations"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2, mb: 2 }}
                />
              </Box>

              <List className="conversations-list">
                {filteredChats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem
                      button
                      className={`conversation-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                      onClick={() => handleStartNewChat(chat)}
                    >
                      <ListItemAvatar>
                        <UserAvatar username={chat.username} online={chat.online} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle1" fontWeight={chat.unread > 0 ? 'bold' : 'normal'}>
                              {chat.username}
                            </Typography>
                            {chat.timestamp && (
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(chat.timestamp).split(',')[0]}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          chat.noConversation ? (
                            <Typography variant="body2" color="text.secondary">
                              Start a new conversation
                            </Typography>
                          ) : (
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
                                {chat.lastMessage}
                              </Typography>
                              {chat.unread > 0 && (
                                <Badge badgeContent={chat.unread} color="primary" />
                              )}
                            </Box>
                          )
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>

            {/* Right section - Chat view */}
            <Box className="chat-view">
              {selectedChat ? (
                <>
                  {/* Chat header */}
                  <Box className="chat-header">
                    <Box display="flex" alignItems="center">
                      <UserAvatar username={selectedChat.username} online={selectedChat.online} />
                      <Box ml={2}>
                        <Typography variant="h6">{selectedChat.username}</Typography>
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
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          // Render different layouts for sent vs received messages
                          return message.sender === 'me' ? (
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
                                  pr: 1
                                }}
                              >
                                <Box sx={{ maxWidth: '70%' }}>
                                  <MessageBubble sender="me">
                                    {message.text}
                                  </MessageBubble>
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
                                    username={selectedChat.username}
                                    online={selectedChat.online}
                                  />
                                </Box>
                                <Box sx={{ maxWidth: '70%' }}>
                                  <MessageBubble sender="other">
                                    {message.text}
                                  </MessageBubble>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </Box>

                  {/* Message input */}
                  <Box className="message-input-area">
                    <form onSubmit={handleSendMessage} className="message-form">
                      <TextField
                        placeholder="Type a message..."
                        variant="outlined"
                        fullWidth
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="submit"
                                color="primary"
                                disabled={newMessage.trim() === ''}
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
                    Select a conversation from the list to start chatting
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default MessagesPage;