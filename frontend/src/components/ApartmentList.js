import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import ApartmentCard from './ApartmentsCard';

const ApartmentsList = ({ apartments }) => {
    if (!apartments || apartments.length === 0) {
        return (
            <Box className="listings-section no-results">
                <Typography variant="h6">
                    No apartments found matching your criteria.
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="listings-section">
            <Grid container spacing={3}>
                {apartments.map((apartment) => (
                    <Grid item xs={12} sm={6} md={6} lg={4} key={apartment._id || apartment.apartment_id}>
                        <ApartmentCard apartment={apartment} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ApartmentsList;