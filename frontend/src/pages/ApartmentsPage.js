import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AppSidebar from '../components/Sidebar';
import ApartmentFilters from '../components/ApartmentFilters';
import ApartmentsList from '../components/ApartmentList';
import { API_BASE_URL } from '../config/api-config';
import '../styles/ApartmentPage.css';

const ApartmentPage = () => {
    const [apartments, setApartments] = useState([]);
    const [filteredApartments, setFilteredApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        area: '',
        minRent: '',
        maxRent: '',
        negotiable: false,
        minSize: '',
        maxSize: '',
        bedrooms: '',
        bathrooms: '',
        rentType: '',
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
    }, [searchQuery, apartments, filters, sortOption]);

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

        // Apply search filter first
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.title.toLowerCase().includes(query) ||
                (apt.optional_details?.more_details &&
                    apt.optional_details.more_details.toLowerCase().includes(query))
            );
        }


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

        // Add this after the area filter and before the price filter
        // Apply Rent Type filter
        if (filters.rentType) {
            if (filters.rentType === 'full') {
                filtered = filtered.filter(apt => apt.rent_type.full_apartment === true);
            } else if (filters.rentType === 'partial') {
                filtered = filtered.filter(apt => apt.rent_type.partial_rent.enabled === true);
            }
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <>
            <AppSidebar />
            <Box className="content apartment-content" display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={6}>
                <Typography variant="h4" component="h1" className="page-title" mb={6}>
                    Apartments for Rent
                </Typography>

                {/* Search Bar */}
                <Box sx={{
                    width: '80%',
                    maxWidth: '50rem',
                    mb: 3,
                    mx: 'auto'
                }}>
                    <TextField
                        fullWidth
                        placeholder="Search apartments by title or description"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#2d4f8f' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClearSearch} edge="end" size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2d4f8f',
                                }
                            }
                        }}
                    />
                </Box>

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