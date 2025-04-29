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
    return (
        <>
            <AppSidebar />
            <Box className="content item-content" display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={6}>
                <Typography variant="h4" component="h1" className="page-title" mb={6}>
                    Items for Sale
                </Typography>
            </Box>
        </>
    );
};

export default ItemPage;