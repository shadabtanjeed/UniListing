import React, { useState } from 'react';
import { Container, TextField, Button, Typography, IconButton, InputAdornment, Box, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/SignUpPage.css';
import { API_BASE_URL } from '../config/api-config';

const SignUpPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Sign Up Successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login'; // Redirect to the login page after 2 seconds
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Sign Up
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {successMessage && <Typography color="primary">{successMessage}</Typography>}
                <form onSubmit={handleSignUp} style={{ width: '100%' }}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        style={{
                            marginTop: '16px',
                            backgroundColor: "#2d4f8f",
                        }}
                    >
                        Sign Up
                    </Button>
                </form>
                <Typography variant="body2" style={{ marginTop: '16px' }}>
                    Already have an account?{' '}
                    <Link
                        component="span"
                        color="primary"
                        onClick={() => window.location.href = '/login'}
                        style={{ cursor: 'pointer' }}
                    >
                        Login
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default SignUpPage;