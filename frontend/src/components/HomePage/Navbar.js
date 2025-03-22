/*
 * NAVBAR COMPONENT
 * Top navigation bar with links to different sections of the website
 */

import React, { useState, useEffect } from 'react';
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
  ListItemIcon
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Logo = () => (
  <Typography
    variant="h5"
    component={Link}
    to="/"
    sx={{
      fontWeight: 700,
      color: '#2d4f8f',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    UniListing
  </Typography>
);

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Simplified navigation items - removed About Us, Contact, and Messages
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Apartments', icon: <ApartmentIcon />, path: '/apartments' },
    { text: 'Marketplace', icon: <ShoppingCartIcon />, path: '/marketplace' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button component={Link} to="/login">
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Login" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: scrolled ? 'white' : 'rgba(255,255,255,0.9)',
        boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        width: '100%', // Ensure full width
        left: 0, // Fix position
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, color: '#2d4f8f' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Logo />

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{
                  mx: 1,
                  color: '#2d4f8f',
                  '&:hover': {
                    backgroundColor: 'rgba(45, 79, 143, 0.08)',
                  }
                }}
              >
                {item.text}
              </Button>
            ))}
          </>
        )}

        <Button
          variant="contained"
          component={Link}
          to="/login"
          startIcon={<PersonIcon />}
          sx={{
            ml: 2,
            backgroundColor: '#2d4f8f',
            '&:hover': {
              backgroundColor: '#1e3a6a',
            }
          }}
        >
          Login
        </Button>
      </Toolbar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        disableScrollLock={true} // Important for preventing body shifts
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;