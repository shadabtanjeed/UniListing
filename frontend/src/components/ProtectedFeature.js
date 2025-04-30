import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button } from '@mui/material';
import { API_BASE_URL } from '../config/api-config';

const ProtectedFeature = ({ children, onAuthSuccess, fallback = null }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const authChecked = useRef(false);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const checkSession = async () => {
            if (authChecked.current) return;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/session`, {
                    method: 'GET',
                    credentials: 'include',
                    signal: controller.signal
                });

                if (isMounted) {
                    setIsAuthenticated(response.ok);
                    authChecked.current = true;
                }
            } catch (error) {
                if (error.name !== 'AbortError' && isMounted) {
                    console.error('Error checking session:', error);
                    setIsAuthenticated(false);
                    authChecked.current = true;
                }
            }
        };

        checkSession();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAuthenticated) {
            if (onAuthSuccess) onAuthSuccess();
        } else {
            setShowAlert(true);
        }
    };

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    const handleLogin = () => {
        navigate('/login');
        setShowAlert(false);
    };

    // Create new child elements with our click handler
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                onClick: handleAction
            });
        }
        return child;
    });

    return (
        <>
            {childrenWithProps}
            <Snackbar
                open={showAlert}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    sx={{ width: '100%' }}
                    onClose={handleAlertClose}
                    action={
                        <Button color="inherit" size="small" onClick={handleLogin}>
                            Log In
                        </Button>
                    }
                >
                    Please log in to use this feature
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProtectedFeature;