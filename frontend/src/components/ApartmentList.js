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
            <Grid container spacing={3} direction="column">
                {apartments.map((apartment) => (
                    <Grid item xs={12} key={apartment._id || apartment.apartment_id}>
                        <ApartmentCard apartment={apartment} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ApartmentsList;