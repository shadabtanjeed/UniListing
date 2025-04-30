import React, { useState, useEffect } from 'react';
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
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathroomIcon from '@mui/icons-material/Bathroom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';


const ApartmentFilters = ({ filters, onFilterChange, sortOption, onSortChange }) => {
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        // Fetch areas from dhaka_areas.txt
        const fetchAreas = async () => {
            try {
                const response = await axios.get('/assets/dhaka_areas.txt');
                const areaList = response.data
                    .split('\n')
                    .filter(area => area.trim() && !area.startsWith('//'))
                    .map(area => area.trim())
                    .sort();
                setAreas(areaList);
            } catch (error) {
                console.error('Error fetching areas:', error);
                setAreas(['Gazipur', 'Mirpur', 'Boardbazar', 'Joydebpur', 'Tongi', 'Uttara']);
            }
        };

        fetchAreas();
    }, []);

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
        onSortChange('default');
    };

    return (
        <Paper className="filter-section">
            <Typography variant="h6" component="h2" className="filter-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon /> Filters
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Sorting Options */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SortIcon /> Sort By
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth size="small">
                        <Select
                            value={sortOption}
                            onChange={(e) => onSortChange(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                            <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                            <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                            <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                            <MenuItem value="date_asc">Date (Oldest First)</MenuItem>
                            <MenuItem value="date_desc">Date (Newest First)</MenuItem>
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Location Filter */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon /> Location
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth size="small">
                        <InputLabel>Area</InputLabel>
                        <Select
                            name="area"
                            value={filters.area || ''}
                            onChange={handleTextChange}
                            label="Area"
                        >
                            <MenuItem value="">Any Area</MenuItem>
                            {areas.map((area) => (
                                <MenuItem key={area} value={area}>{area}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Rent Type Filter */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon /> Rent Type
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth size="small">
                        <InputLabel>Rent Type</InputLabel>
                        <Select
                            name="rentType"
                            value={filters.rentType || ''}
                            onChange={handleTextChange}
                            label="Rent Type"
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="full">Full House</MenuItem>
                            <MenuItem value="partial">Partial Room</MenuItem>
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Price Range Filter */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon /> Price Range (BDT)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                name="minRent"
                                placeholder="Min"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={filters.minRent || ''}
                                onChange={handleTextChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="maxRent"
                                placeholder="Max"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={filters.maxRent || ''}
                                onChange={handleTextChange}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="negotiable"
                                        checked={filters.negotiable || false}
                                        onChange={handleCheckboxChange}
                                    />
                                }
                                label="Negotiable Only"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Size Range Filter */}
            <Accordion >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SquareFootIcon /> Size Range (sqft)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                name="minSize"
                                placeholder="Min"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={filters.minSize || ''}
                                onChange={handleTextChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="maxSize"
                                placeholder="Max"
                                variant="outlined"
                                fullWidth
                                size="small"
                                type="number"
                                value={filters.maxSize || ''}
                                onChange={handleTextChange}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Bedrooms Filter */}
            <Accordion >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BedIcon /> Bedrooms
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth size="small">
                        <Select
                            name="bedrooms"
                            value={filters.bedrooms || ''}
                            onChange={handleTextChange}
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="1">1+</MenuItem>
                            <MenuItem value="2">2+</MenuItem>
                            <MenuItem value="3">3+</MenuItem>
                            <MenuItem value="4">4+</MenuItem>
                            <MenuItem value="5">5+</MenuItem>
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Bathrooms Filter */}
            <Accordion >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BathroomIcon /> Bathrooms
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControl fullWidth size="small">
                        <Select
                            name="bathrooms"
                            value={filters.bathrooms || ''}
                            onChange={handleTextChange}
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="1">1+</MenuItem>
                            <MenuItem value="2">2+</MenuItem>
                            <MenuItem value="3">3+</MenuItem>
                            <MenuItem value="4">4+</MenuItem>
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Amenities Filter */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Amenities</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" flexDirection="column">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.gas"
                                    checked={filters.amenities?.gas || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, gas: e.target.checked }
                                    })}
                                />
                            }
                            label="Gas Supply"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.lift"
                                    checked={filters.amenities?.lift || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, lift: e.target.checked }
                                    })}
                                />
                            }
                            label="Elevator"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.generator"
                                    checked={filters.amenities?.generator || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, generator: e.target.checked }
                                    })}
                                />
                            }
                            label="Generator"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.parking"
                                    checked={filters.amenities?.parking || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, parking: e.target.checked }
                                    })}
                                />
                            }
                            label="Parking"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.security"
                                    checked={filters.amenities?.security || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, security: e.target.checked }
                                    })}
                                />
                            }
                            label="Security"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.balcony"
                                    checked={filters.amenities?.balcony || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, balcony: e.target.checked }
                                    })}
                                />
                            }
                            label="Balcony"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.furnished"
                                    checked={filters.amenities?.furnished || false}
                                    onChange={e => onFilterChange({
                                        amenities: { ...filters.amenities, furnished: e.target.checked }
                                    })}
                                />
                            }
                            label="Furnished"
                        />
                    </Box>
                </AccordionDetails>
            </Accordion>

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