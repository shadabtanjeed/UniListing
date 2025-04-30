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
const ContactInfoCard = ({ item }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                    sx={{
                        backgroundColor: '#2d4f8f',
                        '&:hover': {
                            backgroundColor: '#1e3a6a',
                        },
                    }}
                >
                    Send Message
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