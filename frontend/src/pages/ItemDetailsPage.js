import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Container,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import AppSidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api-config';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { useNavigate } from 'react-router-dom';

// Styles
import '../styles/ItemDetails.css';

// Lazy loaded components
const ItemLocationMap = React.lazy(() => import('../components/ItemLocationMap'));

// Image Carousel Component
const ImageCarousel = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getImageUrl = (image) => {
        try {
            const base64String = btoa(
                new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            return `data:${image.contentType};base64,${base64String}`;
        } catch (err) {
            console.error('Error processing image:', err);
            return 'https://via.placeholder.com/800x500?text=No+Image+Available';
        }
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    if (!images || images.length === 0) {
        return (
            <Box className="image-carousel-container">
                <img
                    src="https://via.placeholder.com/800x500?text=No+Image+Available"
                    alt="No Image Available"
                    className="item-detail-image"
                />
            </Box>
        );
    }

    return (
        <Box className="image-carousel-container">
            <Box className="image-slide">
                <img
                    src={getImageUrl(images[currentImageIndex])}
                    alt={`Item View ${currentImageIndex + 1}`}
                    className="item-detail-image"
                />
            </Box>

            <Box className="carousel-controls">
                <Button className="carousel-button prev" onClick={handlePrevious} disabled={images.length <= 1}>
                    <ChevronLeftIcon />
                </Button>
                <Typography className="image-indicator">
                    {currentImageIndex + 1} / {images.length}
                </Typography>
                <Button className="carousel-button next" onClick={handleNext} disabled={images.length <= 1}>
                    <ChevronRightIcon />
                </Button>
            </Box>
        </Box>
    );
};

// Contact Info Component
// Contact Info Component
const ContactInfoCard = ({ item }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [savedPostId, setSavedPostId] = useState(null);

    // check if item is already saved
    useEffect(() => {
        const checkIfSaved = async () => {
            try {

                const itemIdToCheck = item.item_id;
                console.log("Checking if item is saved with ID:", itemIdToCheck);

                const response = await fetch(`${API_BASE_URL}/api/saved-posts/check/marketplace/${itemIdToCheck}`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Is item saved:", data.isSaved, "PostId:", data.savedPostId);
                    setIsSaved(data.isSaved);
                    setSavedPostId(data.savedPostId);
                }
            } catch (error) {
                console.error('Error checking if item is saved:', error);
            }
        };

        if (item && item.item_id) {
            checkIfSaved();
        }
    }, [item]);

    // save/unsave toggle function
    const handleSaveToggle = async () => {
        try {
            if (isSaved) {
                // Unsave the item
                const response = await fetch(`${API_BASE_URL}/api/saved-posts/unsave/${savedPostId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    setIsSaved(false);
                    setSavedPostId(null);
                    alert('Item unsaved successfully!');
                }
            } else {
                // Save the item
                const response = await fetch(`${API_BASE_URL}/api/saved-posts/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        type: 'marketplace',
                        item_id: item.item_id
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsSaved(true);
                    setSavedPostId(data.postId);
                    alert('Item saved successfully!');
                }
            }
        } catch (error) {
            console.error('Error toggling save status:', error);
            alert('Failed to save/unsave item');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSendMessage = async () => {
        try {
            // Check if posted_by exists and is a valid username
            if (!item.posted_by) {
                throw new Error('Cannot send message: Item poster information is missing');
            }

            console.log("Sending message to user:", item.posted_by);

            const image = item.images && item.images.length > 0 ? item.images[0] : null;
            console.log("Image selected:", image ? "Yes" : "No");

            let imageData = null;
            if (image) {
                console.log("Processing image data...");
                try {
                    imageData = {
                        data: btoa(
                            new Uint8Array(image.data.data).reduce(
                                (data, byte) => data + String.fromCharCode(byte),
                                ''
                            )
                        ),
                        contentType: image.contentType,
                        fileName: image.name,
                    };
                    console.log("Image data processed successfully");
                } catch (imageError) {
                    console.error("Error processing image:", imageError);
                }
            }

            console.log("Sending request to:", `${API_BASE_URL}/api/messages/send`);
            console.log("Request payload:", {
                receiver: item.posted_by,
                text: `I am interested in the item: ${item.title}`,
                imageIncluded: !!imageData
            });

            const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    receiver: item.posted_by,
                    text: `I am interested in the item: ${item.title}`,
                    conversationId: null,
                    image: imageData,
                }),
            });

            console.log("Response status:", response.status);
            const responseData = await response.json();
            console.log("Response data:", responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to send message');
            }

            alert('Message sent successfully!');

            // Add a small delay to ensure the backend has time to process the message
            setTimeout(() => {
                navigate('/messages', { state: { forceRefresh: true } });
            }, 500);
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error.message}`);
        }
    };

    return (
        <Card className="contact-card">
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarTodayIcon color="primary" />
                    <Typography variant="body2">Listed on {formatDate(item.posted_at)}</Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                    Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon color="primary" />
                    <Typography>{item.posted_by}</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="primary" />
                    <Typography>{item.phone}</Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <EmailIcon color="primary" />
                    <Typography>{item.email}</Typography>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<MessageIcon />}
                    onClick={handleSendMessage}
                    sx={{
                        backgroundColor: '#2d4f8f',
                        '&:hover': {
                            backgroundColor: '#1e3a6a',
                        },
                    }}
                >
                    Send Message
                </Button>

                {/* Add Save/Unsave Button */}
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    onClick={handleSaveToggle}
                    sx={{
                        mt: 2, // Add margin top
                        borderColor: "#2d4f8f",
                        color: "#2d4f8f",
                        '&:hover': {
                            borderColor: "#1e3a6a",
                            backgroundColor: "#f0f3f9"
                        }
                    }}
                >
                    {isSaved ? 'Unsave Item' : 'Save Item'}
                </Button>
            </CardContent>
        </Card>
    );
};

// Overview Section
const Overview = ({ item }) => {
    return (
        <Box id="overview-section" className="detail-section">
            <Box className="section-header">
                <DescriptionIcon color="primary" />
                <Typography variant="h6">Overview</Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
                {item.description || 'No description provided for this item.'}
            </Typography>
        </Box>
    );
};

// Location Section
const Location = ({ item }) => {
    const position = item.location.geolocation
        ? [item.location.geolocation.latitude, item.location.geolocation.longitude]
        : [23.7937, 90.4066]; // Default coordinates

    return (
        <Box id="location-section" className="detail-section">
            <Box className="section-header">
                <LocationOnIcon color="primary" />
                <Typography variant="h6">Location</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Address:</strong> {item.location.address}
                </Typography>

                <Box
                    sx={{
                        height: '400px',
                        width: '100%',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    <Suspense
                        fallback={
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                            </Box>
                        }
                    >
                        <ItemLocationMap position={position} address={item.location.address} />
                    </Suspense>
                </Box>
            </Box>
        </Box>
    );
};

// Main Component
const ItemDetailsPage = () => {
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/items/get_item/${itemId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch item details');
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetails();
    }, [itemId]);

    if (loading) {
        return (
            <>
                <AppSidebar />
                <Box className="content item-details-content" display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress style={{ color: '#2d4f8f' }} />
                </Box>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AppSidebar />
                <Box className="content item-details-content">
                    <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
                        {error}
                    </Alert>
                </Box>
            </>
        );
    }

    if (!item) {
        return (
            <>
                <AppSidebar />
                <Box className="content item-details-content">
                    <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                        Item not found
                    </Alert>
                </Box>
            </>
        );
    }

    return (
        <>
            <AppSidebar />
            <Box className="content item-details-content">
                <Container maxWidth="lg">
                    {/* Image Carousel */}
                    <Box mb={4}>
                        <ImageCarousel images={item.images} />
                    </Box>

                    {/* Main Content Grid */}
                    <Grid container spacing={4}>
                        {/* Left Content - Item Details */}
                        <Grid item xs={12} md={8}>
                            {/* Title and Main Info Section */}
                            <Box className="item-title-section" mb={4}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    {item.title}
                                </Typography>

                                <Box className="pricing-info" mb={3}>
                                    <Typography variant="h5" component="p">
                                        {item.price ? item.price.toLocaleString() : 'Price not available'} BDT
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Overview Section */}
                            <Overview item={item} />

                            {/* Location Section */}
                            <Location item={item} />
                        </Grid>

                        {/* Right Content - Contact Info */}
                        <Grid item xs={12} md={4}>
                            <ContactInfoCard item={item} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default ItemDetailsPage;