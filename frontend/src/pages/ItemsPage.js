import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import AppSidebar from '../components/Sidebar';
import ItemsList from '../components/ItemList';
import { API_BASE_URL } from '../config/api-config';
import '../styles/ItemPage.css';

const ItemPage = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchItems();
    }, []);

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
            // setFilteredApartments(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <AppSidebar />
            <Box className="content item-content" display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={6}>
                <Typography variant="h4" component="h1" className="page-title" mb={6}>
                    Items for Sale
                </Typography>

                <Box className="main-container" width="100%" maxWidth="1200px" mb={4}>
                    {/* Filter Section */}
                    {/* <ApartmentFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    /> */}

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
                        <ItemsList
                            items={items}//should be filteredItems after filters are done
                        />
                    )}
                </Box>
            </Box>
        </>
    );
};

export default ItemPage;