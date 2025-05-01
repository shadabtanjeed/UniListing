import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button } from '@mui/material';
import ReactDOM from 'react-dom'; // Add this import
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

    // Create the snackbar component
    const snackbar = (
        <Snackbar
            open={showAlert}
            autoHideDuration={6000}
            onClose={handleAlertClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
                position: 'fixed',
                zIndex: 9999999, // Super high z-index
                top: '80px', // Position below the navbar
                left: '50%',
                transform: 'translateX(-50%)'
            }}
            disablePortal={false} // This is important
            ClickAwayListenerProps={{ onClickAway: () => null }} // Prevent close on click away
        >
            <Alert
                severity="info"
                sx={{
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px'
                }}
                onClose={handleAlertClose}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={handleLogin}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Log In
                    </Button>
                }
            >
                Please log in to use this feature
            </Alert>
        </Snackbar>
    );

    return (
        <>
            {childrenWithProps}
            {/* Render the snackbar directly to the body */}
            {document.body && ReactDOM.createPortal(snackbar, document.body)}
        </>
    );
};

export default ProtectedFeature;