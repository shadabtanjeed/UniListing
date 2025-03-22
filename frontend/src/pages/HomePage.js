/*
 * HOME PAGE COMPONENT
 * Main landing page that combines all section components
 */

import React from 'react';
import { Box, Container } from '@mui/material';

// Import components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturedListings from '../components/FeaturedListings';
import HowItWorks from '../components/HowItWorks';
import RecentListings from '../components/RecentListings';
import StatsSection from '../components/StatsSection';

const HomePage = () => {
    return (
        <Box sx={{ fontFamily: '"Poppins", sans-serif' }}>
            <Navbar />

            {/* Add top padding to account for fixed navbar */}
            <Box sx={{ pt: '64px' }}>
                <HeroSection />

                <Container maxWidth="lg">
                    <FeaturedListings />
                    <HowItWorks />
                    <RecentListings />
                    <StatsSection />
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default HomePage;