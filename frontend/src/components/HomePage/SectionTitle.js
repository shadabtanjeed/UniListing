/*
 * SECTION TITLE COMPONENT
 * Reusable component for section headings with title, subtitle and divider
 */

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const SectionTitle = ({ title, subtitle }) => (
  <Box 
    sx={{ mb: 4, textAlign: 'center' }}
    className="animate-fade-in"
  >
    <Typography 
      variant="h4" 
      component="h2" 
      color="#2d4f8f" 
      fontWeight={600} 
      gutterBottom
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="subtitle1" color="text.secondary">
        {subtitle}
      </Typography>
    )}
    <Divider sx={{ 
      width: '80px', 
      margin: '20px auto', 
      borderWidth: 2, 
      borderColor: '#2d4f8f' 
    }} />
  </Box>
);

export default SectionTitle;