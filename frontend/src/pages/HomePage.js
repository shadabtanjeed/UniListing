/*
 * HOME PAGE COMPONENT
 * Main landing page that combines all section components
 */

import React from 'react';
import { Box, Container } from '@mui/material';

// Import components
import Navbar from '../components/HomePage/Navbar';
import Footer from '../components/HomePage/Footer';
import HeroSection from '../components/HomePage/HeroSection';
import RecentListings from '../components/HomePage/RecentListings';

const HomePage = () => {
    return (
        <Box sx={{ fontFamily: '"Poppins", sans-serif' }}>
            <Navbar />

            {/* Add top padding to account for fixed navbar */}
            <Box sx={{ pt: '64px' }}>
                <HeroSection />

                <Container maxWidth="lg">

                    <RecentListings />
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default HomePage;