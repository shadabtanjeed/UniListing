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
    const [sortOption, setSortOption] = useState('default');
    const [filters, setFilters] = useState({
        area: '',
        minRent: '',
        maxRent: '',
        negotiable: false,
        minSize: '',
        maxSize: '',
        bedrooms: '',
        bathrooms: '',
        amenities: {
            gas: false,
            lift: false,
            generator: false,
            parking: false,
            security: false,
            balcony: false,
            furnished: false
        }
    });

    useEffect(() => {
        fetchApartments();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [apartments, filters, sortOption]);

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

    const applyFiltersAndSort = () => {
        let filtered = [...apartments];

        // Apply Negotiable filter
        if (filters.negotiable) {
            filtered = filtered.filter(apt => apt.rent.negotiable === true);
        }

        // Apply Area filter
        if (filters.area) {
            filtered = filtered.filter(apt =>
                apt.location.area.toLowerCase() === filters.area.toLowerCase()
            );
        }

        // Apply Price Range filter
        if (filters.minRent) {
            filtered = filtered.filter(apt => apt.rent.amount >= Number(filters.minRent));
        }
        if (filters.maxRent) {
            filtered = filtered.filter(apt => apt.rent.amount <= Number(filters.maxRent));
        }

        // Apply Size Range filter
        if (filters.minSize) {
            filtered = filtered.filter(apt =>
                apt.optional_details.size && apt.optional_details.size >= Number(filters.minSize)
            );
        }
        if (filters.maxSize) {
            filtered = filtered.filter(apt =>
                apt.optional_details.size && apt.optional_details.size <= Number(filters.maxSize)
            );
        }

        // Apply Bedroom filter
        if (filters.bedrooms) {
            filtered = filtered.filter(apt => apt.bedrooms.total >= Number(filters.bedrooms));
        }

        // Apply Bathroom filter
        if (filters.bathrooms) {
            filtered = filtered.filter(apt => apt.bathrooms.total >= Number(filters.bathrooms));
        }

        // Apply Amenities filters
        if (filters.amenities) {
            if (filters.amenities.gas) {
                filtered = filtered.filter(apt => apt.amenities.gas === true);
            }
            if (filters.amenities.lift) {
                filtered = filtered.filter(apt => apt.amenities.lift === true);
            }
            if (filters.amenities.generator) {
                filtered = filtered.filter(apt => apt.amenities.generator === true);
            }
            if (filters.amenities.parking) {
                filtered = filtered.filter(apt => apt.amenities.parking === true);
            }
            if (filters.amenities.security) {
                filtered = filtered.filter(apt => apt.amenities.security === true);
            }
            if (filters.amenities.balcony) {
                filtered = filtered.filter(apt => apt.optional_details.balcony === true);
            }
            if (filters.amenities.furnished) {
                filtered = filtered.filter(apt => apt.optional_details.furnished === true);
            }
        }

        // Apply Sorting
        switch (sortOption) {
            case 'name_asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name_desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'price_asc':
                filtered.sort((a, b) => a.rent.amount - b.rent.amount);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.rent.amount - a.rent.amount);
                break;
            default:
                // Default sorting (could be by date_added or most relevant)
                break;
        }

        setFilteredApartments(filtered);
    };


    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleSortChange = (option) => {
        setSortOption(option);
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
                        sortOption={sortOption}
                        onSortChange={handleSortChange}
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