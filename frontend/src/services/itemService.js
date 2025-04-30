import { API_BASE_URL } from '../config/api-config';

export const getRecentItems = async (limit = 4) => {
    try {
        // get all items
        const response = await fetch(`${API_BASE_URL}/api/items/get_items`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const allItems = await response.json();

        // Sort by newest first
        return allItems
            .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at))
            .slice(0, limit)
            .map(item => formatItemForCard(item));
    } catch (error) {
        console.error('Error fetching recent items:', error);
        throw error;
    }
};

// Helper function to format item data for card display
const formatItemForCard = (item) => {
    let imageUrl = 'https://via.placeholder.com/300x200?text=No+Image+Available';

    // get image from the backend data
    if (item.images && item.images.length > 0) {
        try {
            const base64String = btoa(
                new Uint8Array(item.images[0].data.data)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            imageUrl = `data:${item.images[0].contentType};base64,${base64String}`;
        } catch (err) {
            console.error('Error processing image:', err);
        }
    }

    return {
        id: item.item_id,
        title: item.title,
        location: item.location.address,
        price: item.price.toLocaleString(),
        image: imageUrl,
        type: 'marketplace'
    };
};