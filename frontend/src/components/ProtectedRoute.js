import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api-config';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/session`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies with the request
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setIsAuthenticated(false);
            }
        };

        checkSession();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Show a loading indicator while checking authentication
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;