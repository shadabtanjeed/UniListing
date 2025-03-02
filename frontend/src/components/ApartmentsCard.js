import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    SvgIcon,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathroomIcon from '@mui/icons-material/Bathroom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useNavigate } from 'react-router-dom';

// Custom BDT (Bangladeshi Taka) icon
const BdtIcon = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,17.5L9,15.5L11,13.5V15H15V14.5A1.5,1.5 0 0,0 13.5,13A1.5,1.5 0 0,0 12,14.5V15.5A1.5,1.5 0 0,0 13.5,17A1.5,1.5 0 0,0 15,15.5V13.3C15.2,13.1 15.5,13 16,13A2,2 0 0,1 18,15V17H11V17.5M9,6H14V7A2,2 0 0,1 12,9A2,2 0 0,1 10,7H9V9H11V11H9V12H14V11H13V9H14V8H11V7.5H13V7H11V6.5A1.5,1.5 0 0,1 12.5,5A1.5,1.5 0 0,1 14,6.5V7.25L15,6.75V6A2,2 0 0,0 13,4A2,2 0 0,0 11,6" />
    </SvgIcon>
);

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
        <Card className="apartment-card-horizontal" sx={{ height: 'auto', mb: 2 }}>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12} md={4}>
                    <Box sx={{
                        height: { xs: '200px', md: '230px' },
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <CardMedia
                            component="img"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                            image={getFirstImageUrl()}
                            alt={apartment.title}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                    <CardContent sx={{ p: 2 }}>
                        <Box>
                            <Typography variant="h5" component="h3" className="apartment-title" gutterBottom>
                                {apartment.title}
                            </Typography>

                            <Box className="apartment-location" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOnIcon sx={{ mr: 1, color: '#2d4f8f' }} />
                                <Typography variant="body1">
                                    {apartment.location.address}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="body2" color="text.secondary" className="apartment-description"
                                sx={{
                                    mb: 1,
                                    minHeight: '40px',
                                    maxHeight: '60px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                {description}
                            </Typography>

                            <Divider sx={{ my: 1 }} />
                        </Box>

                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={8}>
                                {/* Main details */}
                                <Box className="price-section" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Rent: </Typography>
                                    {/* <BdtIcon sx={{ color: '#2d4f8f' }} /> */}
                                    <Typography variant="h6" component="span" sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                                        {apartment.rent.amount.toLocaleString()} BDT
                                        {apartment.rent.negotiable &&
                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                (Negotiable)
                                            </Typography>
                                        }
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                    {apartment.rent_type.full_apartment ? (
                                        <Chip
                                            avatar={
                                                <Box
                                                    sx={{
                                                        bgcolor: 'white',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        ml: 0.5
                                                    }}
                                                >
                                                    <HomeIcon sx={{ color: '#2d4f8f', fontSize: 16 }} />
                                                </Box>
                                            }
                                            label="Full Apartment"
                                            size="small"
                                            sx={{ bgcolor: '#2d4f8f', color: 'white' }}
                                        />
                                    ) : (
                                        <Chip
                                            avatar={
                                                <Box
                                                    sx={{
                                                        bgcolor: 'white',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        ml: 0.5
                                                    }}
                                                >
                                                    <MeetingRoomIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                                                </Box>
                                            }
                                            label={`Partial (${apartment.rent_type.partial_rent.rooms_available} rooms)`}
                                            size="small"
                                            sx={{ bgcolor: '#ff9800', color: 'white' }}
                                        />
                                    )}

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

                            <Grid item xs={12} sm={4} sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                mt: { xs: 2, sm: 0 }
                            }}>
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