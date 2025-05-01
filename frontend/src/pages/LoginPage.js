import React, { useState } from 'react';
import { Container, TextField, Button, Typography, IconButton, InputAdornment, Box, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../styles/LoginPage.css';
import { API_BASE_URL } from '../config/api-config';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                window.location.href = `/home`;
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server error');
        }
    };

    const handleSignUp = () => {
        window.location.href = '/signup'; // Redirect to the signup page
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
                    Login
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                <form onSubmit={handleLogin} style={{ width: '100%' }}>
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
                        Login
                    </Button>
                </form>
                <Typography variant="body2" style={{ marginTop: '16px' }}>
                    Don't have an account?{' '}
                    <Link
                        component="span"
                        color="primary"
                        onClick={handleSignUp}
                        style={{ cursor: 'pointer' }}
                    >
                        Signup
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default LoginPage;