import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AppSidebar from '../components/Sidebar';
import ItemFilters from '../components/ItemFilters';
import ItemsList from '../components/ItemList';
import { API_BASE_URL } from '../config/api-config';
import CategoryIcon from '@mui/icons-material/Category';
import '../styles/ItemPage.css';

const ItemPage = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        negotiable: false,
    });

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [items, filters, sortOption, searchQuery]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/items/get_items`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setItems(data);
            setFilteredItems(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...items];


        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(item =>
                item.category.toLowerCase().includes(filters.category.toLowerCase())
            );
        }

        // Apply price range filters
        if (filters.minPrice) {
            filtered = filtered.filter(item => item.price >= Number(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(item => item.price <= Number(filters.maxPrice));
        }

        // Apply negotiable filter
        if (filters.negotiable) {
            filtered = filtered.filter(item => item.negotiable === true);
        }

        // Apply sorting
        switch (sortOption) {
            case 'name_asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name_desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'price_asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'date_asc':
                filtered.sort((a, b) => new Date(a.posted_at) - new Date(b.posted_at));
                break;
            case 'date_desc':
                filtered.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
                break;
            default:
                // Default sort: newest first
                filtered.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
                break;
        }

        setFilteredItems(filtered);
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
            <Box className="content item-content" display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={6}>
                <Typography variant="h4" component="h1" className="page-title" mb={6}>
                    Items for Sale
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
                        placeholder="Search items by title or description"
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
                    <ItemFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        sortOption={sortOption}
                        onSortChange={handleSortChange}
                    />

                    {loading ? (
                        <Box className="loading-container" mb={4}>
                            <CircularProgress style={{ color: '#2d4f8f' }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" className="error-alert" mb={4}>
                            {error}
                        </Alert>
                    ) : (
                        <ItemsList
                            items={filteredItems}
                        />
                    )}
                </Box>
            </Box>
        </>
    );
};

export default ItemPage;