import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import AppSidebar from '../components/Sidebar';
import ApartmentFilters from '../components/ApartmentFilters';
import ApartmentCard from '../components/ApartmentsCard';
import ApartmentsList from '../components/ApartmentList';
import { API_BASE_URL } from '../config/api-config';
import '../styles/ApartmentPage.css';

const ApartmentPage = () => {
    const [apartments, setApartments] = useState([]);
    const [filteredApartments, setFilteredApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        area: '',
        minRent: '',
        maxRent: '',
        bedrooms: '',
        furnished: false
    });

    useEffect(() => {
        fetchApartments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [apartments, filters]);

    const fetchApartments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/apartments/all_apartments`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setApartments(data);
            setFilteredApartments(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch apartments');
            console.error('Error fetching apartments:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...apartments];

        if (filters.area) {
            filtered = filtered.filter(apt =>
                apt.location.area.toLowerCase().includes(filters.area.toLowerCase())
            );
        }

        if (filters.minRent) {
            filtered = filtered.filter(apt => apt.rent.amount >= Number(filters.minRent));
        }

        if (filters.maxRent) {
            filtered = filtered.filter(apt => apt.rent.amount <= Number(filters.maxRent));
        }

        if (filters.bedrooms) {
            filtered = filtered.filter(apt => apt.bedrooms.total >= Number(filters.bedrooms));
        }

        if (filters.furnished) {
            filtered = filtered.filter(apt => apt.optional_details.furnished === true);
        }

        setFilteredApartments(filtered);
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    return (
        <>
            <AppSidebar />
            <Box className="content apartment-content" display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={6}>
                <Typography variant="h4" component="h1" className="page-title" mb={6}>
                    Apartments for Rent
                </Typography>

                <Box className="main-container" width="100%" maxWidth="1200px" mb={4}>
                    {/* Filter Section */}
                    <ApartmentFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Apartment Listings */}
                    {loading ? (
                        <Box className="loading-container" mb={4}>
                            <CircularProgress style={{ color: '#2d4f8f' }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" className="error-alert" mb={4}>
                            {error}
                        </Alert>
                    ) : (
                        <ApartmentsList
                            apartments={filteredApartments}
                        />
                    )}
                </Box>
            </Box>
        </>
    );
};

export default ApartmentPage;