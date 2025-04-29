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

const ItemCard = ({ item }) => {
    const navigate = useNavigate();

    // Function to convert Buffer data to image URL
    const getFirstImageUrl = () => {
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

    const handleViewDetails = () => {
        navigate(`/item/${item.item_id}`);
    };

    // Extract description directly from item
    const description = item.description || "No description provided";

    // Format listing date using posted_at
    const formattedDate = item.posted_at ?
        new Date(item.posted_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'Not specified';

    return (
        <Card className="item-card-horizontal" sx={{ height: 'auto', mb: 2 }}>
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
                            alt={item.title}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                    <CardContent sx={{ p: 2 }}>
                        <Box>
                            <Typography variant="h5" component="h3" className="item-title" gutterBottom>
                                {item.title}
                            </Typography>

                            <Box className="item-location" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOnIcon sx={{ mr: 1, color: '#2d4f8f' }} />
                                <Typography variant="body1">
                                    {item.location.address}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="body2" color="text.secondary" className="item-description"
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
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Price: </Typography>
                                    <Typography variant="h6" component="span" sx={{ ml: 0.5, display: 'flex', alignItems: 'center' }}>
                                        {typeof item.price === 'number' 
                                            ? `${item.price.toLocaleString()} BDT`
                                            : 'Contact for price'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                    <Chip
                                        icon={<CalendarTodayIcon />}
                                        label={`Listed: ${formattedDate}`}
                                        size="small"
                                        variant="outlined"
                                    />
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

export default ItemCard;