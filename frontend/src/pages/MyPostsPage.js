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
// import BookmarkIcon from '@mui/icons-material/Bookmark';

import AppSidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api-config';
import '../styles/MyPostsPage.css';

const MyPostsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyPosts();
    }, [activeTab]);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            const type = activeTab === 0 ? 'apartment' : 'marketplace';
            const response = await fetch(`${API_BASE_URL}/api/my_posts/type/${type}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // For apartment type, fetch detailed information for each saved post
            if (type === 'apartment') {
                const detailedPosts = await Promise.all(
                    data.map(async (myPost) => {
                        try {
                            const detailResponse = await fetch(`${API_BASE_URL}/api/apartments/${myPost.apartment_id}`, {
                                credentials: 'include'
                            });

                            if (!detailResponse.ok) {
                                console.warn(`Could not fetch details for apartment ${myPost.apartment_id}`);
                                return { ...myPost, details: null };
                            }

                            const apartmentData = await detailResponse.json();
                            return { ...myPost, details: apartmentData };
                        } catch (error) {
                            console.warn(`Error fetching apartment ${myPost.apartment_id} details:`, error);
                            return { ...myPost, details: null };
                        }
                    })
                );
                setMyPosts(detailedPosts.filter(post => post.details !== null));
            }
            // marketplace type 
            else {
                const detailedPosts = await Promise.all(
                    data.map(async (myPost) => {
                        try {
                            const detailResponse = await fetch(`${API_BASE_URL}/api/items/get_item/${myPost.item_id}`, {
                                credentials: 'include'
                            });

                            if (!detailResponse.ok) {
                                console.warn(`Could not fetch details for item ${myPost.item_id}`);
                                return { ...myPost, details: null };
                            }

                            const itemData = await detailResponse.json();
                            return { ...myPost, details: itemData };
                        } catch (error) {
                            console.warn(`Error fetching item ${myPost.item_id} details:`, error);
                            return { ...myPost, details: null };
                        }
                    })
                );
                setMyPosts(detailedPosts.filter(post => post.details !== null));
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


    const handleViewDetails = (apartmentId) => {
        if (!apartmentId) return;
        // Use the apartment details ID instead of the post ID
        const apartment = myPosts.find(post => post._id === apartmentId);
        if (apartment && apartment.details) {
            navigate(`/apartment/${apartment.details.apartment_id}`);
        }
    };

    const handleViewItemDetails = (itemId) => {
        if (!itemId) return;
        // Use the item details ID instead of the post ID
        const item = myPosts.find(post => post._id === itemId);
        if (item && item.details) {
            navigate(`/item/get_item/${item.details.item_id}`);
        }
    };

    const handleDelete = async (postId, type) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/my_posts/delete/${postId}?type=${type}`, {
                method: 'DELETE',
                credentials: 'include'
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
    
            // Refresh the posts list
            fetchMyPosts();
            alert('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };
    
    const navigateToEdit = (post, type) => {
        if (type === 'apartment') {
            navigate(`/edit-apartment/${post._id}`, { state: { apartment: post } });
        } else {
            navigate(`/edit-item/${post._id}`, { state: { item: post } });
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

    const getFirstItemImageUrl = (item) => {
        // Guard clause to check if item exists
        if (!item || !item.images || !item.images.length) {
            return 'https://via.placeholder.com/300x200?text=No+Image+Available';
        }

        if (item.images && item.images.length > 0) {
            try {
                // Using base64 encoding
                const base64String = btoa(
                    new Uint8Array(item.images[0].data.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                return `data:${item.images[0].contentType};base64,${base64String}`;
            } catch (err) {
                console.error('Error processing image:', err);
                return 'https://via.placeholder.com/300x200?text=No+Image+Available';
            }
        }
        return 'https://via.placeholder.com/300x200?text=No+Image+Available';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderApartmentCards = () => {
        if (myPosts.length === 0 && !loading) {
            return (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        No posts found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        Apartments that you post will appear here
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={3} sx={{ maxWidth: '80rem', mx: 'auto' }}>
                {myPosts.map((post) => {
                    const apartment = post.details;

                    if (!apartment) {
                        return null;
                    }

                    return (
                        <Grid item xs={12} key={post.postId}>
                            <Card className="my-apartment-card" sx={{ maxWidth: '65rem', mx: 'auto' }}>
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
                                                {/* <Button
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
                                                </Button> */}
                                            </Box>

                                            <Box display="flex" alignItems="center" mt={1} mb={2}>
                                                <LocationOnIcon sx={{ color: '#2d4f8f', mr: 1 }} />
                                                <Typography variant="body1">
                                                    {apartment.location
                                                        ? `${apartment.location.area || ''}, ${apartment.location.address || ''}`
                                                        : "Location not specified"}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                                <Box display="flex" alignItems="center" mr={3} mb={1}>
                                                    <Typography variant="h6" color="#2d4f8f" fontWeight="bold">
                                                        {apartment.rent && apartment.rent.amount !== undefined
                                                            ? `${apartment.rent.amount.toLocaleString()} BDT`
                                                            : "Price not specified"}
                                                    </Typography>

                                                    {apartment.rent && apartment.rent.negotiable && (
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
                                                            {apartment.bedrooms ? `${apartment.bedrooms.total} BR` : "N/A"}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <BathroomIcon sx={{ color: '#2d4f8f', mr: 0.5 }} />
                                                        <Typography variant="body2">
                                                            {apartment.bathrooms ? `${apartment.bathrooms.total} Bath` : "N/A"}
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

                                            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => navigateToEdit(post, 'apartment')}
                                                    sx={{
                                                        bgcolor: "#2d4f8f",
                                                        '&:hover': { bgcolor: '#1e3a6a' }
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDelete(post._id, 'apartment')}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleViewDetails(post._id)}
                                                    sx={{
                                                        bgcolor: "#2d4f8f",
                                                        '&:hover': { bgcolor: '#1e3a6a' }
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
        if (myPosts.length === 0 && !loading) {
            return (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        No saved marketplace items found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        Items you save will appear here
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={3} sx={{ maxWidth: '80rem', mx: 'auto' }}>
                {myPosts.map((post) => {
                    const item = post.details;

                    if (!item) {
                        // Skip rendering if item details are not available
                        return null;
                    }

                    return (
                        <Grid item xs={12} key={post.postId}>
                            <Card className="my-apartment-card" sx={{ maxWidth: '65rem', mx: 'auto' }}>
                                <Grid container>
                                    <Grid item xs={12} md={3}>
                                        <Box sx={{ height: '100%', minHeight: 200, position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                sx={{ height: '100%', objectFit: 'cover' }}
                                                image={getFirstItemImageUrl(item)}
                                                alt={item.title}
                                            />
                                            <Box
                                                position="absolute"
                                                top={10}
                                                right={10}
                                                sx={{
                                                    bgcolor: '#2d4f8f', // Changed from '#ff9800'
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
                                                    {item.title}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" mt={1} mb={2}>
                                                <LocationOnIcon sx={{ color: '#2d4f8f', mr: 1 }} />
                                                <Typography variant="body1">
                                                    {item.location && item.location.address
                                                        ? item.location.address
                                                        : "Location not specified"}
                                                </Typography>
                                            </Box>


                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {item.description
                                                    ? (item.description.length > 150
                                                        ? item.description.substring(0, 150) + '...'
                                                        : item.description)
                                                    : "No description available"}
                                            </Typography>

                                            <Divider sx={{ my: 2 }} />

                                            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                                <Box display="flex" alignItems="center" mr={3} mb={1}>
                                                    <Typography variant="h6" color="#2d4f8f" fontWeight="bold"> {/* Changed from '#ff9800' */}
                                                        {item.price !== undefined && item.price !== null
                                                            ? `${item.price.toLocaleString()} BDT`
                                                            : "Price not specified"}
                                                    </Typography>
                                                    {item.negotiable && (
                                                        <Chip
                                                            label="Negotiable"
                                                            size="small"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Box>

                                                <Box display="flex" gap={2} flexWrap="wrap">
                                                    <Chip
                                                        label={item.category || "Uncategorized"}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#f0f3f9',
                                                            color: '#2d4f8f',
                                                            fontWeight: 500
                                                        }}
                                                    />

                                                </Box>
                                            </Box>

                                            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => navigateToEdit(post, 'marketplace')}
                                                    sx={{
                                                        bgcolor: "#2d4f8f",
                                                        '&:hover': { bgcolor: '#1e3a6a' }
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDelete(post._id, 'marketplace')}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleViewItemDetails(post._id)}
                                                    sx={{
                                                        bgcolor: "#2d4f8f",
                                                        '&:hover': { bgcolor: '#1e3a6a' }
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
                    My Posts
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

export default MyPostsPage;