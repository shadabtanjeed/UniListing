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
                } else {
                    window.location.href = '/';
                }
            } catch (err) {
                window.location.href = '/';
            }
        };

        fetchUsername();
    }, []);

    return (
        <>
            <AppSidebar />
            <Box className="content welcome-content"> {/* Added 'content' class for opacity effect */}
                <Typography variant="h4" component="h1">
                    Welcome {username}
                </Typography>
            </Box>
        </>
    );
};

export default WelcomePage;
