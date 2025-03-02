import React from 'react';
import {
    Paper,
    Typography,
    Divider,
    Box,
    TextField,
    Slider,
    FormControlLabel,
    Checkbox,
    Button
} from '@mui/material';

const ApartmentFilters = ({ filters, onFilterChange }) => {
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
            area: '',
            minRent: '',
            maxRent: '',
            bedrooms: '',
            furnished: false
        });
    };

    return (
        <Paper className="filter-section">
            <Typography variant="h6" component="h2" className="filter-title">
                Filters
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box className="filter-group">
                <Typography variant="subtitle2">Location</Typography>
                <TextField
                    name="area"
                    placeholder="Area (e.g., Gulshan, Banani)"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={filters.area}
                    onChange={handleTextChange}
                    margin="normal"
                />
            </Box>

            <Box className="filter-group">
                <Typography variant="subtitle2">Price Range (BDT)</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        name="minRent"
                        placeholder="Min"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.minRent}
                        onChange={handleTextChange}
                        margin="normal"
                    />
                    <TextField
                        name="maxRent"
                        placeholder="Max"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={filters.maxRent}
                        onChange={handleTextChange}
                        margin="normal"
                    />
                </Box>
            </Box>

            <Box className="filter-group">
                <Typography variant="subtitle2">Bedrooms</Typography>
                <TextField
                    name="bedrooms"
                    select
                    SelectProps={{
                        native: true,
                    }}
                    fullWidth
                    size="small"
                    value={filters.bedrooms}
                    onChange={handleTextChange}
                    margin="normal"
                >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                </TextField>
            </Box>

            <Box className="filter-group">
                <FormControlLabel
                    control={
                        <Checkbox
                            name="furnished"
                            checked={filters.furnished}
                            onChange={handleCheckboxChange}
                            color="primary"
                        />
                    }
                    label="Furnished Only"
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

export default ApartmentFilters;