import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/session', {
                    credentials: 'include'
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        // You could return a loading spinner here
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;