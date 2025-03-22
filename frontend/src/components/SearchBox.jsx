/*
 * SEARCH BOX COMPONENT
 * Search functionality for apartments and marketplace items
 */

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  InputAdornment,
  Box,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Styled components
const StyledSearchBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '800px',
  width: '100%',
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SearchBox = () => {
  const [searchType, setSearchType] = useState('apartment');
  const [searchArea, setSearchArea] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load areas from file
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/assets/dhaka_areas.txt');
        const text = await response.text();
        
        // Parse text file - each line is an area
        const areasList = text
          .split('\n')
          .filter(area => area.trim() && !area.startsWith('//')) // Remove empty lines and comments
          .map(area => area.trim())
          .sort(); // Sort alphabetically
        
        setAreas(areasList);
      } catch (error) {
        console.error('Error loading areas:', error);
        // Fallback to default areas if file cannot be loaded
        setAreas([
          'Gazipur',
          'Mirpur',
          'Boardbazar',
          'Joydebpur',
          'Tongi',
          'Uttara',
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const url = searchType === 'apartment' 
      ? `/apartments/search?area=${searchArea}&keyword=${searchKeyword}`
      : `/marketplace/search?area=${searchArea}&keyword=${searchKeyword}`;
    
    navigate(url);
  };

  // Common menu props to prevent scrollbar issues
  const menuProps = {
    disableScrollLock: true, // Changed to true to prevent layout shifts
    PaperProps: {
      style: {
        maxHeight: 300
      }
    },
    // These props help prevent layout shifts
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    // Prevent autofocus to reduce shifting
    autoFocus: false
  };

  return (
    <StyledSearchBox 
      elevation={3}
      className="animate-fade-in"
      style={{ animationDelay: '0.6s' }}
    >
      <form onSubmit={handleSearch}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="search-type-label">I'm looking for</InputLabel>
              <Select
                labelId="search-type-label"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                label="I'm looking for"
                MenuProps={menuProps}
              >
                <MenuItem value="apartment">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ApartmentIcon sx={{ mr: 1 }} />
                    Apartments
                  </Box>
                </MenuItem>
                <MenuItem value="item">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    Items
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="area-label">Area</InputLabel>
              <Select
                labelId="area-label"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                label="Area"
                disabled={loading}
                startAdornment={
                  loading ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }
                MenuProps={menuProps}
              >
                <MenuItem value="">Any area</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search keywords"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large"
              type="submit"
              sx={{ 
                height: '56px',
                backgroundColor: '#2d4f8f',
                '&:hover': {
                  backgroundColor: '#1e3a6a',
                }
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </form>
    </StyledSearchBox>
  );
};

export default SearchBox;