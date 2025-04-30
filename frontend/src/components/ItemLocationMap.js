import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const ItemLocationMap = ({ position, address }) => {
    // Create a ref for the map container
    const mapRef = React.useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Set the default icon for markers
        L.Marker.prototype.options.icon = DefaultIcon;

        // Initialize the map
        const map = L.map(mapRef.current).setView(position, 15);

        // Add the tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a marker at the position
        const marker = L.marker(position).addTo(map);

        // Add popup with address
        if (address) {
            marker.bindPopup(address).openPopup();
        }

        // Make sure the map renders properly
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // Cleanup function to remove the map when component unmounts
        return () => {
            map.remove();
        };
    }, [position, address]); // Re-run if position or address changes

    return (
        <div
            ref={mapRef}
            style={{ height: '100%', width: '100%' }}
        ></div>
    );
};

export default ItemLocationMap;