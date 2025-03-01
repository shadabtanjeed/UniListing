import React, { useEffect, useState } from 'react';
import AppSidebar from '../components/Sidebar';
import { Box, Typography } from '@mui/material';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/session', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setUsername(data.username);
                }
                // Removed the else block with window.location.href redirect
                // as the ProtectedRoute component now handles this
            } catch (err) {
                console.error('Error fetching username:', err);
                // Removed redirect as it's handled by ProtectedRoute
            }
        };

        fetchUsername();
    }, []);

    return (
        <>
            <AppSidebar />
            <Box className="content welcome-content">
                <Typography variant="h4" component="h1">
                    Welcome {username}
                </Typography>
            </Box>
        </>
    );
};

export default WelcomePage;