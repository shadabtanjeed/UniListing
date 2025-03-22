/*
 * HERO SECTION COMPONENT
 * Top banner section with background image and search functionality
 */

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchBox from './SearchBox';

const StyledHeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/hero-background.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '500px',
  height: '70vh', // Responsive height based on viewport
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  textAlign: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(6),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: '100vh', // Full height on mobile for better visibility
    padding: theme.spacing(1),
  },
}));

const HeroSection = () => {
  return (
    <StyledHeroSection className="hero-section">
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h1" 
          fontWeight={700} 
          gutterBottom
          className="animate-fade-in"
          sx={{ 
            animationDelay: '0.2s',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
          }}
        >
          Find Your Perfect Space at IUT
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: { xs: 3, md: 6 }, 
            maxWidth: '800px', 
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
          }}
          className="animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          Connecting IUT students with housing and marketplace solutions
        </Typography>
        
        <SearchBox />
      </Container>
    </StyledHeroSection>
  );
};

export default HeroSection;