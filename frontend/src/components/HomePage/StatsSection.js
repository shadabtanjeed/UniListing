/*
 * STATS SECTION COMPONENT
 * Displays platform statistics and a call-to-action button
 */

import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const StatsSection = () => {
  return (
    <Box 
      sx={{ 
        my: 8, 
        py: 6, 
        backgroundImage: 'linear-gradient(rgba(45, 79, 143, 0.9), rgba(45, 79, 143, 0.9)), url("/images/campus-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '10px',
        color: 'white',
        textAlign: 'center'
      }}
      className="animate-fade-in"
    >
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Trusted by IUT Students
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 6 }}>
          Join hundreds of students who have found their perfect housing and marketplace deals
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" className="stagger-children">
          {[
            { count: '200+', label: 'Apartments Listed' },
            { count: '500+', label: 'Items for Sale' },
            { count: '1000+', label: 'Active Users' },
            { count: '150+', label: 'Deals Closed' }
          ].map((stat, index) => (
            <Grid 
              item 
              xs={6} 
              md={3} 
              key={index}
              className="animate-fade-in"
            >
              <Typography 
                variant="h3" 
                fontWeight={700}
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {stat.count}
              </Typography>
              <Typography variant="body1">{stat.label}</Typography>
            </Grid>
          ))}
        </Grid>
        
        <Button 
          component={Link}
          to="/signup"
          variant="contained" 
          size="large" 
          sx={{ 
            mt: 6, 
            bgcolor: 'white', 
            color: '#2d4f8f',
            '&:hover': {
              bgcolor: '#f0f0f0',
            }
          }}
        >
          Join Hospilink Today
        </Button>
      </Container>
    </Box>
  );
};

export default StatsSection;