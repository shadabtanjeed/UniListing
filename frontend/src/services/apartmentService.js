/*
 * APARTMENT SERVICE
 * Contains all API calls related to apartment listings
 */

import api from './api';

export const getRecentApartments = async (limit = 4) => {
    try {
        const response = await api.get(`/apartments/recent?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent apartments:', error);
        throw error;
    }
};

export const searchApartments = async (area, keyword) => {
    try {
        const response = await api.get('/apartments/search', {
            params: { area, keyword }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching apartments:', error);
        throw error;
    }
};