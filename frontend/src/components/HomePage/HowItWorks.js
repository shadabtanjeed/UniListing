/*
 * HOW IT WORKS COMPONENT
 * Explains the steps to use the platform in a visually appealing way
 */

import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import SectionTitle from './SectionTitle';

const HowItWorks = () => {
  return (
    <Box sx={{ my: 8, py: 6, backgroundColor: '#f8f9fa', borderRadius: '10px', px: 4 }}>
      <SectionTitle
        title="How UniListing Works"
        subtitle="Easy steps to find what you need or list what you have"
      />

      <Grid container spacing={4} justifyContent="center" className="stagger-children">
        {[
          {
            step: 1,
            title: "Create an Account",
            description: "Register with your IUT email to join our community of students"
          },
          {
            step: 2,
            title: "Browse or List",
            description: "Search for housing or items, or list what you want to rent/sell"
          },
          {
            step: 3,
            title: "Connect & Transact",
            description: "Message other users and finalize your housing or purchase"
          }
        ].map((step) => (
          <Grid
            item
            xs={12}
            md={4}
            key={step.step}
            textAlign="center"
            className="animate-fade-in"
          >
            <Box sx={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#2d4f8f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}>
              <Typography variant="h4" color="white">{step.step}</Typography>
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>{step.title}</Typography>
            <Typography>{step.description}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HowItWorks;