import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api-config';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);

    useEffect(() => {
        // Redirect to signup if no user data is found
        if (!userData) {
            navigate('/signup');
            return;
        }
    }, [userData, navigate]);

    useEffect(() => {
        // Set up countdown timer for resend button
        let interval = null;
        if (timer > 0 && resendDisabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && resendDisabled) {
            setResendDisabled(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer, resendDisabled]);

    const handleOtpChange = (e) => {
        // Only allow numbers and limit to 6 digits
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    const handleVerifyOtp = async () => {
        // Validate OTP
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Verify OTP
            const verifyResponse = await fetch(`${API_BASE_URL}/api/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    otp: otp
                }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                throw new Error(verifyData.message || 'Failed to verify OTP');
            }

            setSuccess('OTP verified successfully');

            // Complete registration
            const registerResponse = await fetch(`${API_BASE_URL}/api/otp/complete-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerData.message || 'Registration failed');
            }

            setSuccess('Registration successful! Redirecting to login...');

            // Redirect to login page after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Resend OTP
            const response = await fetch(`${API_BASE_URL}/api/otp/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            setSuccess('New OTP sent to your email');
            setTimer(60);
            setResendDisabled(true);

        } catch (err) {
            setError(err.message);
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
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ color: '#2d4f8f', fontWeight: 600 }}>
                        Email Verification
                    </Typography>

                    <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                        We've sent a verification code to<br />
                        <strong>{userData?.email}</strong>
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TextField
                        label="Enter 6-digit OTP"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={otp}
                        onChange={handleOtpChange}
                        inputProps={{
                            maxLength: 6,
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2d4f8f',
                                }
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleVerifyOtp}
                        disabled={loading || !otp || otp.length !== 6}
                        sx={{
                            mt: 2,
                            mb: 2,
                            backgroundColor: '#2d4f8f',
                            '&:hover': {
                                backgroundColor: '#1e3a6a',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#a0aec0',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
                    </Button>

                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Didn't receive the code?
                        </Typography>
                        <Button
                            variant="text"
                            onClick={handleResendOtp}
                            disabled={resendDisabled || loading}
                            sx={{
                                color: '#2d4f8f',
                                '&.Mui-disabled': {
                                    color: '#a0aec0',
                                }
                            }}
                        >
                            {resendDisabled ? `Resend OTP (${timer}s)` : 'Resend OTP'}
                        </Button>
                    </Box>
                </Paper>

                <Button
                    variant="text"
                    onClick={() => navigate('/signup')}
                    sx={{ mt: 2, color: '#2d4f8f' }}
                >
                    Back to Sign Up
                </Button>
            </Box>
        </Container>
    );
};

export default OTPVerification;