import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Box,
    Button
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathroomIcon from '@mui/icons-material/Bathroom';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useNavigate } from 'react-router-dom';

const ApartmentCard = ({ apartment }) => {
    const navigate = useNavigate();

    // Function to convert Buffer data to image URL
    const getFirstImageUrl = () => {
        if (apartment.images && apartment.images.length > 0) {
            // Using base64 encoding
            const base64String = btoa(
                new Uint8Array(apartment.images[0].data.data)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            return `data:${apartment.images[0].contentType};base64,${base64String}`;
        }
        return 'https://via.placeholder.com/300x200?text=No+Image+Available';
    };

    const handleViewDetails = () => {
        navigate(`/apartment/${apartment.apartment_id}`);
    };

    return (
        <Card className="apartment-card">
            <CardMedia
                component="img"
                height="200"
                image={getFirstImageUrl()}
                alt={apartment.location.address}
                className="apartment-image"
            />
            <CardContent>
                <Typography variant="h6" component="h3" className="apartment-title">
                    {apartment.location.address}
                </Typography>

                <Box className="apartment-location">
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">
                        {apartment.location.area}
                    </Typography>
                </Box>

                <Box className="apartment-details">
                    <Box className="price-section">
                        <CurrencyRupeeIcon fontSize="small" />
                        <Typography variant="h6" component="span">
                            {apartment.rent.amount.toLocaleString()} BDT
                            {apartment.rent.negotiable && <span className="negotiable-tag"> (Negotiable)</span>}
                        </Typography>
                    </Box>

                    <Box className="features-section">
                        <Box className="feature">
                            <BedIcon fontSize="small" />
                            <Typography variant="body2">
                                {apartment.bedrooms.total} BR
                            </Typography>
                        </Box>
                        <Box className="feature">
                            <BathroomIcon fontSize="small" />
                            <Typography variant="body2">
                                {apartment.bathrooms.total} Bath
                            </Typography>
                        </Box>
                        <Box className="feature">
                            <SquareFootIcon fontSize="small" />
                            <Typography variant="body2">
                                {apartment.optional_details.size || 'N/A'} sqft
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
            <CardActions className="card-actions">
                <Button
                    variant="contained"
                    size="medium"
                    onClick={handleViewDetails}
                    sx={{
                        bgcolor: "#2d4f8f",
                        '&:hover': {
                            bgcolor: '#1e3a6a',
                        }
                    }}
                >
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
};

export default ApartmentCard;