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
        <Grid container spacing={4} justifyContent="center">
          <Grid
            item
            xs={12}
            md={4}
            className="animate-slide-left"
            sx={{ textAlign: 'center' }}
          >
            <Typography variant="h6" gutterBottom>UniListing</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Connecting IUT students with housing solutions and marketplace items since 2025.
            </Typography>
            <Typography variant="body2">
              Islamic University of Technology (IUT)<br />
              Board Bazar, Gazipur-1704
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mt: 6, textAlign: 'center' }}>
          © {new Date().getFullYear()} UniListing. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;