/*
 * FEATURED LISTINGS COMPONENT
 * Displays featured apartments and marketplace items in tabs
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Tabs, Tab, Button } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';
import SectionTitle from './SectionTitle';
import ListingCard from './ListingCard';
import { getRecentApartments } from '../services/apartmentService';

const FeaturedListings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for marketplace items
  const marketplaceItems = [
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
    {
      id: 3,
      title: 'Engineering Textbook Set',
      location: 'IUT Campus',
      price: '1,200',
      image: 'https://via.placeholder.com/300x200?text=Textbooks',
      type: 'item'
    },
    {
      id: 4,
      title: 'Mountain Bike (Almost New)',
      location: 'Joydebpur',
      price: '7,000',
      image: 'https://via.placeholder.com/300x200?text=Bicycle',
      type: 'item'
    },
  ];

  // Fetch recent apartments from backend
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const data = await getRecentApartments(4);
        setApartments(data);
      } catch (error) {
        console.error('Failed to fetch apartments:', error);
        // Fallback to dummy data if API fails
        setApartments([
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
          {
            id: 3,
            title: 'Student-friendly Studio Apartment',
            location: 'Tongi, Gazipur',
            price: '8,000',
            image: 'https://via.placeholder.com/300x200?text=Apartment+3',
            type: 'apartment'
          },
          {
            id: 4,
            title: 'Luxury 4BR Duplex near Campus',
            location: 'Uttara, Dhaka',
            price: '25,000',
            image: 'https://via.placeholder.com/300x200?text=Apartment+4',
            type: 'apartment'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ mb: 8 }}>
      <SectionTitle 
        title="Featured Listings" 
        subtitle="Discover our top picks for housing and items around IUT"
      />
      
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTab-root': { 
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minWidth: '150px',
            },
            '& .Mui-selected': {
              color: '#2d4f8f',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2d4f8f',
            },
          }}
        >
          <Tab 
            icon={<ApartmentIcon />} 
            iconPosition="start" 
            label="Apartments" 
          />
          <Tab 
            icon={<ShoppingCartIcon />} 
            iconPosition="start" 
            label="Marketplace" 
          />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 4 }} className="stagger-children">
        {tabValue === 0 ? (
          <Grid container spacing={3}>
            {apartments.map((apartment) => (
              <Grid item key={apartment.id} xs={12} sm={6} md={3}>
                <ListingCard {...apartment} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {marketplaceItems.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={3}>
                <ListingCard {...item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          component={Link}
          to={tabValue === 0 ? "/apartments" : "/marketplace"}
          variant="outlined" 
          size="large"
          sx={{ 
            borderColor: '#2d4f8f', 
            color: '#2d4f8f',
            px: 4,
            '&:hover': {
              borderColor: '#1e3a6a',
              backgroundColor: 'rgba(45, 79, 143, 0.04)',
            }
          }}
        >
          View All {tabValue === 0 ? 'Apartments' : 'Items'}
        </Button>
      </Box>
    </Box>
  );
};

export default FeaturedListings;