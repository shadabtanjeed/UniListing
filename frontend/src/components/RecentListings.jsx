/*
 * RECENT LISTINGS COMPONENT
 * Shows recently added apartments and marketplace items
 */

import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SectionTitle from './SectionTitle';
import { getRecentApartments } from '../services/apartmentService';

const RecentListings = () => {
  const [recentApartments, setRecentApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for marketplace items
  const recentItems = [
    {
      id: 1,
      title: 'HP Laptop (i5, 8GB RAM, 512GB SSD)',
      location: 'IUT Campus',
      price: '45,000',
      image: 'https://via.placeholder.com/300x200?text=Laptop',
      type: 'item'
    },
    {
      id: 2,
      title: 'Study Desk with Chair',
      location: 'Boardbazar',
      price: '3,500',
      image: 'https://via.placeholder.com/300x200?text=Study+Desk',
      type: 'item'
    },
  ];

  // Fetch recent apartments from backend
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const data = await getRecentApartments(2);
        setRecentApartments(data);
      } catch (error) {
        console.error('Failed to fetch recent apartments:', error);
        // Fallback to dummy data if API fails
        setRecentApartments([
          {
            id: 1,
            title: 'Spacious 3BR Apartment near IUT',
            location: 'Boardbazar, Gazipur',
            price: '15,000',
            image: 'https://via.placeholder.com/300x200?text=Apartment+1',
            type: 'apartment'
          },
          {
            id: 2,
            title: 'Modern 2BR with Balcony',
            location: 'Joydebpur, Gazipur',
            price: '12,000',
            image: 'https://via.placeholder.com/300x200?text=Apartment+2',
            type: 'apartment'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  return (
    <Box sx={{ mb: 8 }}>
      <SectionTitle 
        title="Recently Added" 
        subtitle="The latest apartments and items listed on Hospilink"
      />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6} className="animate-slide-left">
          <Typography variant="h6" gutterBottom sx={{ 
            borderLeft: '4px solid #2d4f8f', 
            pl: 2,
            fontWeight: 600
          }}>
            New Apartments
          </Typography>
          
          <Grid container spacing={2}>
            {recentApartments.map((apartment) => (
              <Grid item key={apartment.id} xs={12}>
                <Card sx={{ 
                  display: 'flex', 
                  height: '140px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 180 }}
                    image={apartment.image}
                    alt={apartment.title}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{apartment.title}</Typography>
                    <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#2d4f8f', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {apartment.location}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="#2d4f8f" sx={{ mt: 'auto' }}>
                      {apartment.price} BDT
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button 
              variant="text" 
              component={Link}
              to="/apartments"
              sx={{ color: '#2d4f8f' }}
            >
              View all apartments →
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6} className="animate-slide-right">
          <Typography variant="h6" gutterBottom sx={{ 
            borderLeft: '4px solid #ff9800', 
            pl: 2,
            fontWeight: 600
          }}>
            New Marketplace Items
          </Typography>
          
          <Grid container spacing={2}>
            {recentItems.map((item) => (
              <Grid item key={item.id} xs={12}>
                <Card sx={{ 
                  display: 'flex', 
                  height: '140px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                  },
                }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 180 }}
                    image={item.image}
                    alt={item.title}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{item.title}</Typography>
                    <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#ff9800', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.location}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="#ff9800" sx={{ mt: 'auto' }}>
                      {item.price} BDT
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button 
              variant="text" 
              component={Link}
              to="/marketplace"
              sx={{ color: '#ff9800' }}
            >
              View all items →
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecentListings;