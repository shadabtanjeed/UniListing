import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api-config';
import { CircularProgress, Box } from '@mui/material';

const AuthRedirect = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/session`, {
                    method: 'GET',
                    credentials: 'include',
                });

                setIsAuthenticated(response.ok);
            } catch (error) {
                console.error('Error checking session:', error);
                setIsAuthenticated(false);
            }
        };

        checkSession();
    }, []);

    if (isAuthenticated === null) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress sx={{ color: '#2d4f8f' }} />
            </Box>
        );
    }

    return isAuthenticated ? <Navigate to="/" /> : children;
};

export default AuthRedirect;