import React, { useEffect, useState } from 'react';
import AppSidebar from '../components/Sidebar';
import { Box, Typography } from '@mui/material';
import '../styles/WelcomePage.css';
import { API_BASE_URL } from '../config/api-config';

const WelcomePage = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/session`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setUsername(data.username);
                }

            } catch (err) {
                console.error('Error fetching username:', err);
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