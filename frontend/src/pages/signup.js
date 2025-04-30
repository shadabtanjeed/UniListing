import React, { useState } from 'react';
import { Container, TextField, Button, Typography, IconButton, InputAdornment, Box, Link, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUpPage.css';
import { API_BASE_URL } from '../config/api-config';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validate input
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim() || !password) {
            setError('All fields are required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }



        setLoading(true);
        setError(null);

        try {
            // First step: Send OTP to email
            const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    username,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send verification code');
            }

            // Store user data and navigate to OTP verification page
            const userData = {
                firstName,
                lastName,
                email,
                username,
                password
            };

            navigate('/verify-otp', { state: { userData } });

        } catch (err) {
            setError(err.message || 'Server error');
        } finally {
            setLoading(false);
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
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <form onSubmit={handleSignUp} style={{ width: '100%' }}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                        disabled={loading}
                        style={{
                            marginTop: '16px',
                            backgroundColor: "#2d4f8f",
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                    </Button>
                </form>
                <Typography variant="body2" style={{ marginTop: '16px' }}>
                    Already have an account?{' '}
                    <Link
                        component="span"
                        color="primary"
                        onClick={() => navigate('/login')}
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