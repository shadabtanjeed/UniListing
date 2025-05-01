import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Snackbar, Alert, Button, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ReactDOM from 'react-dom';

// The ProtectedFeature component remains the same
export const ProtectedFeature = ({ children, onAuthSuccess, fallback = null }) => {
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleAction = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!isAuthenticated) {
            setShowAlert(true);
        } else if (onAuthSuccess) {
            onAuthSuccess();
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
                zIndex: 9999999,
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}
            disablePortal={false}
            ClickAwayListenerProps={{ onClickAway: () => null }}
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
            {document.body && ReactDOM.createPortal(snackbar, document.body)}
        </>
    );
};

// The main ProtectedRoute component for route protection
// The main ProtectedRoute component for route protection
const ProtectedRoute = ({ children }) => {
    const [showAlert, setShowAlert] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If not authenticated, show alert
        if (isAuthenticated === false) {
            setShowAlert(true);
        }
    }, [isAuthenticated]);

    const handleAlertClose = () => {
        setShowAlert(false);
        // Navigate to home page after closing alert
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/login', { state: { from: location.pathname } });
        setShowAlert(false);
    };

    if (isAuthenticated === null || isAuthenticated === undefined) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress sx={{ color: '#2d4f8f' }} />
            </Box>
        );
    }

    // Create the snackbar component
    const snackbar = (
        <Snackbar
            open={showAlert && !isAuthenticated}
            autoHideDuration={6000}
            onClose={handleAlertClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
                position: 'fixed',
                zIndex: 9999999,
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)'
            }}
            disablePortal={false}
            ClickAwayListenerProps={{ onClickAway: () => null }}
        >
            <Alert
                severity="warning"
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
                This page requires authentication to access. You will be redirected to home page.
            </Alert>
        </Snackbar>
    );

    // Return children if authenticated, otherwise show alert and empty content
    return (
        <>
            {isAuthenticated ? children : null}
            {document.body && ReactDOM.createPortal(snackbar, document.body)}
        </>
    );
};

export default ProtectedRoute;