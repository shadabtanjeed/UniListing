import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathroomIcon from '@mui/icons-material/Bathroom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useNavigate } from 'react-router-dom';

const ApartmentCard = ({ apartment }) => {
    const navigate = useNavigate();

    // Function to convert Buffer data to image URL
    const getFirstImageUrl = () => {
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
        return 'https://via.placeholder.com/300x200?text=No+Image+Available';
    };

    const handleViewDetails = () => {
        navigate(`/apartment/${apartment.apartment_id}`);
    };

    // Extract description from more_details or set default
    const description = apartment.optional_details?.more_details || "No description provided";

    // Format listing date
    const formattedDate = apartment.listing_date ?
        new Date(apartment.listing_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'Not specified';

    return (
        <Card className="apartment-card-horizontal">
            <Grid container>
                <Grid item xs={12} md={4}>
                    <CardMedia
                        component="img"
                        sx={{
                            height: '100%',
                            minHeight: { xs: '200px', md: '300px' },
                            objectFit: 'cover'
                        }}
                        image={getFirstImageUrl()}
                        alt={apartment.title}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <CardContent sx={{ height: '100%', p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h5" component="h3" className="apartment-title" gutterBottom>
                                {apartment.title}
                            </Typography>

                            <Box className="apartment-location" sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                <LocationOnIcon sx={{ mt: 0.3, mr: 1, color: '#2d4f8f' }} />
                                <Typography variant="body1">
                                    {apartment.location.address}, {apartment.location.area}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="body2" color="text.secondary" className="apartment-description"
                                sx={{
                                    mb: 2,
                                    minHeight: '60px',
                                    maxHeight: '80px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                {description}
                            </Typography>

                            <Divider sx={{ my: 2 }} />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                {/* Main details */}
                                <Box className="price-section" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Rent: </Typography>
                                    <AttachMoneyIcon sx={{ color: '#2d4f8f' }} /> {/* BDT icon replacement */}
                                    <Typography variant="h6" component="span" sx={{ ml: 0.5 }}>
                                        {apartment.rent.amount.toLocaleString()} BDT
                                        {apartment.rent.negotiable &&
                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                (Negotiable)
                                            </Typography>
                                        }
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {/* Rental type */}
                                    {apartment.rent_type.full_apartment ? (
                                        <Chip
                                            icon={<HomeIcon />}
                                            label="Full Apartment"
                                            size="small"
                                            sx={{ bgcolor: '#2d4f8f', color: 'white' }}
                                        />
                                    ) : (
                                        <Chip
                                            icon={<MeetingRoomIcon />}
                                            label={`Partial (${apartment.rent_type.partial_rent.rooms_available} rooms)`}
                                            size="small"
                                            sx={{ bgcolor: '#ff9800', color: 'white' }}
                                        />
                                    )}

                                    {/* Listing date */}
                                    <Chip
                                        icon={<CalendarTodayIcon />}
                                        label={`Listed: ${formattedDate}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box className="features-section" sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Box className="feature" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <BedIcon sx={{ mr: 0.5, color: '#2d4f8f' }} />
                                        <Typography variant="body2">
                                            {apartment.bedrooms.total} BR
                                        </Typography>
                                    </Box>
                                    <Box className="feature" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <BathroomIcon sx={{ mr: 0.5, color: '#2d4f8f' }} />
                                        <Typography variant="body2">
                                            {apartment.bathrooms.total} Bath
                                        </Typography>
                                    </Box>
                                    <Box className="feature" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <SquareFootIcon sx={{ mr: 0.5, color: '#2d4f8f' }} />
                                        <Typography variant="body2">
                                            {apartment.optional_details.size || 'N/A'} sqft
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                {/* Upvotes visualization */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            p: 1,
                                            width: 80,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <ThumbUpIcon
                                            sx={{
                                                color: apartment.upvotes.count > 0 ? '#2d4f8f' : '#9e9e9e',
                                                fontSize: 24,
                                                mb: 0.5
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            component="span"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: apartment.upvotes.count > 0 ? '#2d4f8f' : '#9e9e9e'
                                            }}
                                        >
                                            {apartment.upvotes.count}
                                        </Typography>
                                    </Paper>
                                </Box>

                                {/* View details button */}
                                <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={handleViewDetails}
                                    sx={{
                                        bgcolor: "#2d4f8f",
                                        '&:hover': {
                                            bgcolor: '#1e3a6a',
                                        },
                                        minWidth: '120px'
                                    }}
                                >
                                    View Details
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
};

export default ApartmentCard;