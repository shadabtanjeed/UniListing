/*
 * APARTMENT SERVICE
 * Contains all API calls related to apartment listings
 */

import api from './api';
import { API_BASE_URL } from '../config/api-config';


export const getRecentApartments = async (limit = 4) => {
    try {
        // Using your existing endpoint to get all apartments
        const response = await fetch(`${API_BASE_URL}/api/apartments/all_apartments`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const allApartments = await response.json();

        // Sort by listing_date (newest first) and limit results
        return allApartments
            .sort((a, b) => new Date(b.listing_date) - new Date(a.listing_date))
            .slice(0, limit)
            .map(apartment => formatApartmentForCard(apartment));
    } catch (error) {
        console.error('Error fetching recent apartments:', error);
        throw error;
    }
};

export const getFeaturedApartments = async (limit = 4) => {
    try {
        // Using your existing endpoint to get all apartments
        const response = await fetch(`${API_BASE_URL}/api/apartments/all_apartments`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const allApartments = await response.json();

        // Get random apartments for featured section
        const shuffled = allApartments.sort(() => 0.5 - Math.random());
        return shuffled
            .slice(0, limit)
            .map(apartment => formatApartmentForCard(apartment));
    } catch (error) {
        console.error('Error fetching featured apartments:', error);
        throw error;
    }
};

// Helper function to format apartment data for card display
const formatApartmentForCard = (apartment) => {
    let imageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

    // Try to get image from the backend data
    if (apartment.images && apartment.images.length > 0) {
        try {
            const base64String = btoa(
                new Uint8Array(apartment.images[0].data.data)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            imageUrl = `data:${apartment.images[0].contentType};base64,${base64String}`;
        } catch (err) {
            console.error('Error processing image:', err);
            // Fallback to default image if error processing
        }
    }

    return {
        id: apartment.apartment_id,
        title: apartment.title,
        location: apartment.location.area,
        price: apartment.rent.amount.toLocaleString(),
        image: imageUrl,
        type: 'apartment'
    };
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