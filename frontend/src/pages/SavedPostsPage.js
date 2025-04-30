import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Chip,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathroomIcon from '@mui/icons-material/Bathroom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import AppSidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api-config';
import '../styles/SavedPostsPage.css';

const SavedPostsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedPosts();
    }, [activeTab]);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const type = activeTab === 0 ? 'apartment' : 'marketplace';
            const response = await fetch(`${API_BASE_URL}/api/saved-posts/type/${type}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // For apartment type, fetch detailed information for each saved post
            if (type === 'apartment') {
                const detailedPosts = await Promise.all(
                    data.map(async (savedPost) => {
                        try {
                            const detailResponse = await fetch(`${API_BASE_URL}/api/apartments/${savedPost.apartment_id}`, {
                                credentials: 'include'
                            });

                            if (!detailResponse.ok) {
                                console.warn(`Could not fetch details for apartment ${savedPost.apartment_id}`);
                                return { ...savedPost, details: null };
                            }

                            const apartmentData = await detailResponse.json();
                            return { ...savedPost, details: apartmentData };
                        } catch (error) {
                            console.warn(`Error fetching apartment ${savedPost.apartment_id} details:`, error);
                            return { ...savedPost, details: null };
                        }
                    })
                );
                setSavedPosts(detailedPosts.filter(post => post.details !== null));
            } else {
                setSavedPosts(data);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch saved posts');
            console.error('Error fetching saved posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };


    // OPTION 1: Change the function to accept apartmentId directly
    const handleViewDetails = (apartmentId) => {
        navigate(`/apartment/${apartmentId}`);
    };



    const handleUnsave = async (postId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/saved-posts/unsave/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                // Refresh the saved posts list
                fetchSavedPosts();
                alert('Post removed from saved items');
            } else {
                throw new Error('Failed to remove from saved items');
            }
        } catch (error) {
            console.error('Error removing saved post:', error);
            alert('Error: Failed to remove from saved items');
        }
    };

    // Function to convert Buffer data to image URL
    const getFirstImageUrl = (apartment) => {
        // guard clause to check if apartment exists
        if (!apartment || !apartment.images || !apartment.images.length) {
            return 'https://via.placeholder.com/300x200?text=No+Image+Available';
        }

        if (apartment.images && apartment.images.length > 0) {
            try {
                // Using base64 encoding
                const base64String = btoa(
                    new Uint8Array(apartment.images[0].data.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                return `data:${apartment.images[0].contentType};base64,${base64String}`;
            } catch (err) {
                console.error('Error processing image:', err);
                return 'https://via.placeholder.com/300x200?text=No+Image+Available';
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderApartmentCards = () => {
        if (savedPosts.length === 0 && !loading) {
            return (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        No saved apartments found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        Apartments you save will appear here
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={3} sx={{ maxWidth: '80rem', mx: 'auto' }}>
                {savedPosts.map((post) => {
                    const apartment = post.details;

                    if (!apartment) {
                        // Skip rendering if apartment details are not available
                        return null;
                    }

                    return (
                        <Grid item xs={12} key={post.postId}>
                            <Card className="saved-apartment-card" sx={{ maxWidth: '65rem', mx: 'auto' }}>
                                <Grid container>
                                    <Grid item xs={12} md={3}>
                                        <Box sx={{ height: '100%', minHeight: 200, position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                sx={{ height: '100%', objectFit: 'cover' }}
                                                image={getFirstImageUrl(apartment)}
                                                alt={apartment.title}
                                            />
                                            <Box
                                                position="absolute"
                                                top={10}
                                                right={10}
                                                sx={{
                                                    bgcolor: '#2d4f8f',
                                                    color: 'white',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                Saved on {formatDate(post.dateSaved)}
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={9}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                <Typography variant="h5" component="h2" className="apartment-title">
                                                    {apartment.title}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<BookmarkIcon />}
                                                    onClick={() => handleUnsave(post.postId)}
                                                    sx={{
                                                        width: '6rem',
                                                        minWidth: 'fit-content',
                                                        fontSize: '0.75rem',
                                                        border: '1px solid #d32f2f',
                                                        '&:hover': {
                                                            backgroundColor: '#ffebee',
                                                            borderColor: '#c62828',
                                                        }
                                                    }}
                                                >
                                                    Unsave
                                                </Button>
                                            </Box>

                                            <Box display="flex" alignItems="center" mt={1} mb={2}>
                                                <LocationOnIcon sx={{ color: '#2d4f8f', mr: 1 }} />
                                                <Typography variant="body1">
                                                    {apartment.location.area}, {apartment.location.address}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                                <Box display="flex" alignItems="center" mr={3} mb={1}>
                                                    <Typography variant="h6" color="#2d4f8f" fontWeight="bold">
                                                        {apartment.rent.amount.toLocaleString()} BDT
                                                    </Typography>
                                                    {apartment.rent.negotiable && (
                                                        <Chip
                                                            label="Negotiable"
                                                            size="small"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Box>

                                                <Box display="flex" gap={2} flexWrap="wrap">
                                                    <Box display="flex" alignItems="center">
                                                        <BedIcon sx={{ color: '#2d4f8f', mr: 0.5 }} />
                                                        <Typography variant="body2">
                                                            {apartment.bedrooms.total} BR
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <BathroomIcon sx={{ color: '#2d4f8f', mr: 0.5 }} />
                                                        <Typography variant="body2">
                                                            {apartment.bathrooms.total} Bath
                                                        </Typography>
                                                    </Box>
                                                    {apartment.optional_details && apartment.optional_details.size && (
                                                        <Box display="flex" alignItems="center">
                                                            <SquareFootIcon sx={{ color: '#2d4f8f', mr: 0.5 }} />
                                                            <Typography variant="body2">
                                                                {apartment.optional_details.size} sqft
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box mt={3} display="flex" justifyContent="flex-end">
                                                <Button
                                                    variant="contained"
                                                    // Then in your button onClick:
                                                    onClick={() => handleViewDetails(apartment.apartment_id || apartment._id)}
                                                    sx={{
                                                        bgcolor: "#2d4f8f",
                                                        '&:hover': {
                                                            bgcolor: '#1e3a6a',
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    const renderMarketplaceCards = () => {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                    Marketplace saved items coming soon
                </Typography>
            </Box>
        );
    };

    return (
        <>
            <AppSidebar />
            <Box className="content saved-posts-content">
                <Typography
                    variant="h4"
                    component="h1"
                    className="page-title"
                    mb={4}
                    sx={{ textAlign: 'center' }} // Add this line to center the text
                >
                    Saved Posts
                </Typography>

                <Paper sx={{
                    width: '40rem',
                    maxWidth: '100%',
                    mx: 'auto',
                    mb: 4
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                            },
                            '& .Mui-selected': {
                                color: '#2d4f8f',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#2d4f8f',
                            },
                        }}
                    >
                        <Tab label="Apartments" />
                        <Tab label="Marketplace Items" />
                    </Tabs>
                </Paper>

                {loading ? (
                    <Box display="flex" justifyContent="center" my={8}>
                        <CircularProgress sx={{ color: '#2d4f8f' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                ) : (
                    <Box>
                        {activeTab === 0 ? renderApartmentCards() : renderMarketplaceCards()}
                    </Box>
                )}
            </Box>
        </>
    );
};

export default SavedPostsPage;