import React from 'react';
import {
    Paper,
    Typography,
    Divider,
    Box,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    Select,
    MenuItem,
    FormControl,
    Grid
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';

const ItemFilters = ({ filters, onFilterChange, sortOption, onSortChange }) => {
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        onFilterChange({ [name]: checked });
    };

    const handleClearFilters = () => {
        onFilterChange({
            category: '',
            minPrice: '',
            maxPrice: '',
            negotiable: false,
        });
        onSortChange('default');
    };

    return (
        <Paper className="filter-section" sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" className="filter-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon /> Filters
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Sorting Options - No Accordion */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'medium' }}>
                    <SortIcon /> Sort By
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="default">Default (Newest)</MenuItem>
                        <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                        <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                        <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                        <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                        <MenuItem value="date_desc">Date (Newest First)</MenuItem>
                        <MenuItem value="date_asc">Date (Oldest First)</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Category Filter - No Accordion */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'medium' }}>
                    <CategoryIcon /> Category
                </Typography>
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
                >
                    <option value="">Any</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="books">Books</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                </TextField>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Price Range Filter - No Accordion */}
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'medium' }}>
                    <AttachMoneyIcon /> Price Range (BDT)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        name="minPrice"
                        placeholder="Min"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.minPrice}
                        onChange={handleTextChange}
                        fullWidth
                    />
                    <TextField
                        name="maxPrice"
                        placeholder="Max"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.maxPrice}
                        onChange={handleTextChange}
                        fullWidth
                    />
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            name="negotiable"
                            checked={filters.negotiable || false}
                            onChange={handleCheckboxChange}
                        />
                    }
                    label="Negotiable Only"
                    sx={{ mt: 1 }}
                />
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