import React from 'react';
import {
    Paper,
    Typography,
    Divider,
    Box,
    TextField,
    FormControlLabel,
    Checkbox,
    Button
} from '@mui/material';

const ItemFilters = ({ filters, onFilterChange }) => {
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    const handleClearFilters = () => {
        onFilterChange({
            category: '',
            minPrice: '',
            maxPrice: '',
        });
    };

    return (
        <Paper className="filter-section">
            <Typography variant="h6" component="h2" className="filter-title">
                Filters
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box className="filter-group">
                <Typography variant="subtitle2">Category</Typography>
                <TextField
                    name="category"
                    select
                    SelectProps={{
                        native: true,
                    }}
                    fullWidth
                    size="small"
                    value={filters.category}
                    onChange={handleTextChange}
                    margin="normal"
                >
                    <option value="">Any</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="books">Books</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                </TextField>
            </Box>

            <Box className="filter-group">
                <Typography variant="subtitle2">Price Range (BDT)</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        name="minPrice"
                        placeholder="Min"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.minPrice}
                        onChange={handleTextChange}
                        margin="normal"
                    />
                    <TextField
                        name="maxPrice"
                        placeholder="Max"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.maxPrice}
                        onChange={handleTextChange}
                        margin="normal"
                    />
                </Box>
            </Box>

            <Button
                variant="outlined"
                fullWidth
                onClick={handleClearFilters}
                sx={{
                    mt: 2,
                    color: '#2d4f8f',
                    borderColor: '#2d4f8f',
                    '&:hover': {
                        borderColor: '#1e3a6a'
                    }
                }}
            >
                Clear Filters
            </Button>
        </Paper>
    );
};

export default ItemFilters;