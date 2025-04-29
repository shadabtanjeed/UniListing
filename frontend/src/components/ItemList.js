import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import ItemCard from './ItemsCard';

const ItemsList = ({ items }) => {
    if (!items || items.length === 0) {
        return (
            <Box className="listings-section no-results">
                <Typography variant="h6">
                    No items found matching your criteria.
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="listings-section">
            <Grid container spacing={1}>  {/* Reduced spacing to 1 */}
                {items.map((item) => (
                    <Grid item xs={12} key={item._id || item.item_id}>
                        <ItemCard item={item} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ItemsList;