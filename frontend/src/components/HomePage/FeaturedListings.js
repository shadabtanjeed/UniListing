/*
 * FEATURED LISTINGS COMPONENT
 * Displays featured apartments and marketplace items in tabs
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Tabs, Tab, Button, Skeleton } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';
import SectionTitle from './SectionTitle';
import ListingCard from './ListingCard';
import { getFeaturedApartments } from '../../services/apartmentService';

const FeaturedListings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for marketplace items with real images
  const marketplaceItems = [
    {
      id: 1,
      title: 'HP Laptop (i5, 8GB RAM, 512GB SSD)',
      location: 'IUT Campus',
      price: '45,000',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      type: 'item'
    },
    {
      id: 2,
      title: 'Study Desk with Chair',
      location: 'Boardbazar',
      price: '3,500',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80',
      type: 'item'
    },
    {
      id: 3,
      title: 'Engineering Textbook Set',
      location: 'IUT Campus',
      price: '1,200',
      image: 'https://images.unsplash.com/photo-1592986035658-8965d493bc75?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
      type: 'item'
    },
    {
      id: 4,
      title: 'Mountain Bike (Almost New)',
      location: 'Joydebpur',
      price: '7,000',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      type: 'item'
    },
  ];

  // Fetch featured/random apartments from backend
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedApartments(4);
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
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            type: 'apartment'
          },
          {
            id: 2,
            title: 'Modern 2BR with Balcony',
            location: 'Joydebpur, Gazipur',
            price: '12,000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80',
            type: 'apartment'
          },
          {
            id: 3,
            title: 'Student-friendly Studio Apartment',
            location: 'Tongi, Gazipur',
            price: '8,000',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            type: 'apartment'
          },
          {
            id: 4,
            title: 'Luxury 4BR Duplex near Campus',
            location: 'Uttara, Dhaka',
            price: '25,000',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
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

  // Loading skeleton for cards
  const CardSkeleton = () => (
    <Grid item xs={12} sm={6} md={3}>
      <Box sx={{ height: 340, borderRadius: '10px', overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={200} width="100%" />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={24} width="60%" />
          <Skeleton variant="text" height={28} width="40%" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="rectangular" height={36} width="40%" />
            <Skeleton variant="circular" height={36} width={36} />
          </Box>
        </Box>
      </Box>
    </Grid>
  );

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
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              apartments.map((apartment) => (
                <Grid item key={apartment.id} xs={12} sm={6} md={3}>
                  <ListingCard {...apartment} />
                </Grid>
              ))
            )}
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