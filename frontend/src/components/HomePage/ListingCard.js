/*
 * LISTING CARD COMPONENT
 * Card component for displaying apartment or marketplace item listings
 */

import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';

const ListingCard = ({ id, image, title, location, price, type }) => {
  const navigate = useNavigate();
  
  const handleDetailsClick = () => {
    if (type === 'apartment') {
      navigate(`/apartments/${id}`);
    } else {
      navigate(`/marketplace/${id}`);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
      className="card-hover animate-fade-in"
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={image || `https://via.placeholder.com/300x200?text=${title}`}
          alt={title}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: type === 'apartment' ? '#2d4f8f' : '#ff9800',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {type === 'apartment' ? 'APARTMENT' : 'ITEM'}
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <LocationOnIcon sx={{ 
            fontSize: 18, 
            color: type === 'apartment' ? '#2d4f8f' : '#ff9800', 
            mr: 0.5 
          }} />
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          color={type === 'apartment' ? '#2d4f8f' : '#ff9800'} 
          fontWeight={600}
        >
          {price} BDT
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleDetailsClick}
            sx={{ 
              borderColor: type === 'apartment' ? '#2d4f8f' : '#ff9800', 
              color: type === 'apartment' ? '#2d4f8f' : '#ff9800',
              '&:hover': {
                borderColor: type === 'apartment' ? '#1e3a6a' : '#e68a00',
                backgroundColor: type === 'apartment' 
                  ? 'rgba(45, 79, 143, 0.04)' 
                  : 'rgba(255, 152, 0, 0.04)',
              }
            }}
          >
            Details
          </Button>
          <IconButton 
            size="small" 
            sx={{ color: '#f44336' }}
            aria-label="add to favorites"
          >
            <FavoriteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ListingCard;