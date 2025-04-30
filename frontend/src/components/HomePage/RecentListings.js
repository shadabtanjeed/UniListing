import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardMedia, Button, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SectionTitle from './SectionTitle';
import { getRecentApartments } from '../../services/apartmentService';
import { getRecentItems } from '../../services/itemService';

const RecentListings = () => {
  const [recentApartments, setRecentApartments] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  // Fetch recent apartments from backend
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoadingApartments(true);
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
          }
        ]);
      } finally {
        setLoadingApartments(false);
      }
    };

    fetchApartments();
  }, []);

  // Fetch recent items from backend 
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const data = await getRecentItems(2);
        setRecentItems(data);
      } catch (error) {
        console.error('Failed to fetch recent items:', error);
        // Fallback to dummy data if API fails
        setRecentItems([
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
          }
        ]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  // Loading skeleton for both card type
  const CardSkeleton = () => (
    <Grid item xs={12}>
      <Card sx={{ display: 'flex', height: '140px' }}>
        <Skeleton variant="rectangular" sx={{ width: 180, height: '100%' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flexGrow: 1 }}>
          <Skeleton variant="text" width="70%" height={30} />
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="30%" height={28} sx={{ mt: 'auto' }} />
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ mb: 8 }}>
      <SectionTitle
        title="Recently Added"
        subtitle="The latest apartments and items listed on UniListing"
      />

      <Grid container spacing={4}>
        {/* Apartments Section */}
        <Grid item xs={12} md={6} className="animate-slide-left">
          <Typography variant="h6" gutterBottom sx={{
            borderLeft: '4px solid #2d4f8f',
            pl: 2,
            mb: 1.5,
            fontWeight: 600
          }}>
            New Apartments
          </Typography>

          <Grid container spacing={2}>
            {loadingApartments ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              recentApartments.map((apartment) => (
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
                      sx={{ width: 180, height: '100%', objectFit: 'cover' }}
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
              ))
            )}
          </Grid>

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="text"
              component={Link}
              to="/view-apartments"
              sx={{ color: '#2d4f8f' }}
            >
              View all apartments →
            </Button>
          </Box>
        </Grid>

        {/* Items Section */}
        <Grid item xs={12} md={6} className="animate-slide-right">
          <Typography variant="h6" gutterBottom sx={{
            borderLeft: '4px solid #ff9800',
            pl: 2,
            mb: 1.5,
            fontWeight: 600
          }}>
            New Marketplace Items
          </Typography>

          <Grid container spacing={2}>
            {loadingItems ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              recentItems.map((item) => (
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
                      sx={{ width: 180, height: '100%', objectFit: 'cover' }}
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
              ))
            )}
          </Grid>

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="text"
              component={Link}
              to="/view-marketplace"
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