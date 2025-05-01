import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Avatar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import GridViewIcon from '@mui/icons-material/GridView';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { API_BASE_URL } from '../config/api-config';
import logo from '../unilisting_rectangle.png';

const AppNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Refs for dropdown menus
  const createMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // State for dropdown menus
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setCreateMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleCreateMenuToggle = () => {
    setCreateMenuOpen(!createMenuOpen);
  };

  const handleProfileMenuToggle = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Navigation items
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Apartments', icon: <ApartmentIcon />, path: '/view-apartments' },
    { text: 'Marketplace', icon: <ShoppingCartIcon />, path: '/view-marketplace' },
  ];

  // Create dropdown items
  const createItems = [
    { text: 'New Apartment', icon: <ApartmentIcon />, path: '/add-apartments' },
    { text: 'New Item', icon: <ShoppingCartIcon />, path: '/add-item' },
  ];

  // Profile dropdown items for logged in users
  const profileItems = [
    { text: 'My Posts', icon: <GridViewIcon />, path: '/my_posts' },
    { text: 'Saved Posts', icon: <BookmarkIcon />, path: '/saved-posts' },
    { text: 'Messages', icon: <BookmarkIcon />, path: '/messages' },
    { divider: true },
    { text: 'Logout', icon: <LogoutIcon />, onClick: handleLogout }
  ];

  // Mobile drawer content
  const drawer = (
    <Box
      sx={{ width: 250, paddingTop: 2 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path} sx={{ color: '#2d4f8f' }}>
            <ListItemIcon sx={{ color: '#2d4f8f' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {isAuthenticated ? (
          <>
            <Divider />
            <ListItem sx={{ paddingBottom: 0, paddingTop: 1 }}>
              <ListItemText primary="Create" primaryTypographyProps={{ fontWeight: 'bold', color: 'text.secondary' }} />
            </ListItem>
            {createItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path} sx={{ color: '#2d4f8f' }}>
                <ListItemIcon sx={{ color: '#2d4f8f' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}

            <Divider />
            <ListItem sx={{ paddingBottom: 0, paddingTop: 1 }}>
              <ListItemText primary="Account" primaryTypographyProps={{ fontWeight: 'bold', color: 'text.secondary' }} />
            </ListItem>
            {profileItems.map((item, index) => (
              item.divider ?
                <Divider key={`divider-${index}`} sx={{ my: 1 }} /> :
                <ListItem
                  button
                  key={item.text}
                  component={item.onClick ? 'div' : Link}
                  to={item.onClick ? undefined : item.path}
                  onClick={item.onClick}
                  sx={{ color: '#2d4f8f' }}
                >
                  <ListItemIcon sx={{ color: '#2d4f8f' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
            ))}
          </>
        ) : (
          <ListItem button component={Link} to="/login" sx={{ color: '#2d4f8f' }}>
            <ListItemIcon sx={{ color: '#2d4f8f' }}><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#2d4f8f',
        boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1200,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo/Title */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            color: 'white',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img src={logo} alt="UniListing" style={{ height: '40px', marginRight: '10px' }} />

        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}

            {isAuthenticated && (
              <Box ref={createMenuRef} sx={{ position: 'relative' }}>
                <Button
                  sx={{
                    mx: 1,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                  startIcon={<AddCircleIcon />}
                  endIcon={<KeyboardArrowDownIcon />}
                  onClick={handleCreateMenuToggle}
                >
                  Create
                </Button>

                {createMenuOpen && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      mt: 1,
                      bgcolor: '#2d4f8f', // Change to blue background
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      borderRadius: 1,
                      width: 200,
                      zIndex: 1300,
                    }}
                  >
                    {createItems.map((item) => (
                      <MenuItem
                        key={item.text}
                        component={Link}
                        to={item.path}
                        sx={{
                          py: 1.5,
                          color: 'white', // Make text white
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
                        <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                      </MenuItem>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {isAuthenticated ? (
              <Box ref={profileMenuRef} sx={{ position: 'relative', ml: 1 }}>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuToggle}
                    size="small"
                    sx={{
                      p: 0.5,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: '#2d4f8f' }}>
                      <AccountCircleIcon />
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {profileMenuOpen && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      mt: 1,
                      bgcolor: '#2d4f8f', // Change to blue background
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      borderRadius: 1,
                      width: 200,
                      zIndex: 1300,
                    }}
                  >
                    {profileItems.map((item, index) => (
                      item.divider ?
                        <Divider key={`divider-${index}`} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} /> :
                        <MenuItem
                          key={item.text}
                          component={item.onClick ? 'div' : Link}
                          to={item.onClick ? undefined : item.path}
                          onClick={item.onClick}
                          sx={{
                            py: 1.5,
                            color: 'white', // Make text white
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.text} />
                        </MenuItem>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Button
                variant="contained"
                component={Link}
                to="/login"
                startIcon={<AccountCircleIcon />}
                sx={{
                  ml: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#2d4f8f',
                  '&:hover': {
                    backgroundColor: 'white',
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        disableScrollLock={true}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default AppNavbar;