/*
 * FOOTER COMPONENT
 * Website footer with links, newsletter subscription and company info
 */

import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#1e3a6a', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} className="animate-slide-left">
            <Typography variant="h6" gutterBottom>Hospilink</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Connecting IUT students with housing solutions and marketplace items since 2023.
            </Typography>
            <Typography variant="body2">
              Islamic University of Technology (IUT)<br />
              Board Bazar, Gazipur-1704
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2} className="animate-fade-in">
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>Quick Links</Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/" color="inherit" underline="hover">Home</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/apartments" color="inherit" underline="hover">Apartments</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/marketplace" color="inherit" underline="hover">Marketplace</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/about" color="inherit" underline="hover">About Us</MuiLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2} className="animate-fade-in">
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>Support</Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/faq" color="inherit" underline="hover">FAQ</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/contact" color="inherit" underline="hover">Contact Us</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/privacy" color="inherit" underline="hover">Privacy Policy</MuiLink>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <MuiLink component={Link} to="/terms" color="inherit" underline="hover">Terms of Service</MuiLink>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} className="animate-slide-right">
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>Subscribe to Our Newsletter</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Get the latest listings and marketplace updates.
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Your email"
                fullWidth
                sx={{ 
                  mr: 1,
                  bgcolor: 'white',
                  borderRadius: 1
                }}
              />
              <Button 
                variant="contained"
                sx={{ 
                  bgcolor: '#2d4f8f',
                  '&:hover': {
                    bgcolor: '#3d5fa0',
                  }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="body2" sx={{ mt: 6, textAlign: 'center' }}>
          © {new Date().getFullYear()} Hospilink. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;