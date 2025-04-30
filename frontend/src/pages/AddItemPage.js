import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Input, IconButton, Snackbar, Alert, FormControlLabel, Checkbox, Box } from '@mui/material'; // Import Snackbar and Alert
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../components/Sidebar';
import '../styles/AddItemPage.css';
import { v4 as uuidv4 } from 'uuid';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from 'axios';
import { API_BASE_URL } from '../config/api-config';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categories = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Other'];

function AddItemPage() {
    const navigate = useNavigate();
    const generateItemId = () => `ITEM${uuidv4().slice(0, 6)}`;

    const [itemData, setItemData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        negotiable: false,
        email: '',
        phone: '',
        images: [],
        location: { address: '', geolocation: { latitude: 23.9475, longitude: 90.3792 } },
        posted_by: '',
        posted_at: '',
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/session', {
                    withCredentials: true,
                });
                setItemData((prev) => ({
                    ...prev,
                    posted_by: response.data.username,
                    posted_at: new Date().toISOString(),
                }));
            } catch (error) {
                console.error('Error fetching username:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        setItemData((prev) => ({ ...prev, item_id: generateItemId() }));
        fetchUsername();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested properties like location.address
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setItemData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setItemData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setItemData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleImageUpload = (e) => {
        const input = e.target;
        const files = Array.from(input.files).filter((file) => file.type.startsWith('image/'));

        if (files.length === 0) {
            alert('Please upload only image files.');
            return;
        }

        const readFiles = files.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    resolve({
                        contentType: file.type,
                        name: file.name,
                        data: reader.result.split(',')[1],
                    });
                };
                reader.onerror = reject;
            });
        });

        Promise.all(readFiles)
            .then((newImages) => {
                setItemData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...newImages],
                }));
            })
            .catch((error) => console.error('Error processing images:', error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const transformedImages = itemData.images.map((image) => ({
            data: image.data,
            contentType: image.contentType,
            name: image.name,
        }));

        const dataToSend = {
            ...itemData,
            images: transformedImages,
            location: {
                ...itemData.location,
                geolocation: {
                    latitude: Number(itemData.location.geolocation.latitude),
                    longitude: Number(itemData.location.geolocation.longitude),
                },
            },
        };

        fetch(`${API_BASE_URL}/api/items/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add item');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Success:', data);
                setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
                setTimeout(() => navigate('/view-marketplace'), 2000); // Delay navigation by 2 seconds
            })
            .catch((error) => {
                console.error('Error:', error);
                setSnackbar({ open: true, message: 'Failed to add item.', severity: 'error' }); // Show error message
            });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    const LocationSelector = ({ setItemData }) => {
        useMapEvents({
            click(e) {
                if (e.originalEvent.target.closest('.move-to-current-location-button')) {
                    return;
                }

                const { lat, lng } = e.latlng;
                setItemData((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        geolocation: { latitude: lat, longitude: lng },
                    },
                }));
            },
        });

        return null;
    };

    const MoveToCurrentLocation = ({ setItemData }) => {
        const map = useMap();

        const handleMoveToCurrentLocation = (event) => {
            event.stopPropagation();

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        map.flyTo([latitude, longitude], 17);

                        setItemData((prev) => ({
                            ...prev,
                            location: {
                                ...prev.location,
                                geolocation: { latitude, longitude },
                            },
                        }));
                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                        alert('Unable to fetch your location. Please enable location services.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        };

        return (
            <IconButton
                className="move-to-current-location-button"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                    padding: '8px',  // Add padding
                    width: '40px',   // Set fixed width
                    height: '40px',  // Set fixed height
                    borderRadius: '4px', // Make it slightly rounded
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={handleMoveToCurrentLocation}
            >
                <MyLocationIcon style={{ color: '#1976d2', fontSize: '22px' }} />
            </IconButton>
        );
    };

    return (
        <>
            <AppSidebar />
            <div className="AddItemPage">
                <div className="formContainer">
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Title" name="title" onChange={handleChange} required />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            name="category"
                            value={itemData.category || ''}
                            onChange={handleChange}
                            required
                        >
                            {categories.map((category, index) => (
                                <MenuItem key={index} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Price Field */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', gap: 2 }}>
                            <TextField
                                sx={{ flex: '0 0 80%' }}
                                label="Price"
                                name="price"
                                // Change to text type to have more control
                                type="text"
                                value={itemData.price}
                                onChange={(e) => {
                                    // Only allow numbers and decimal point
                                    const value = e.target.value;
                                    // Regex to match only numbers and single decimal point
                                    if (value === '' || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
                                        setItemData(prev => ({ ...prev, price: value }));
                                    }
                                }}
                                required
                                inputProps={{
                                    inputMode: 'decimal', // Helps show numeric keyboard on mobile
                                }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="negotiable"
                                        checked={itemData.negotiable}
                                        onChange={handleCheckboxChange}
                                    />
                                }
                                label="Negotiable"
                                sx={{ flex: '0 0 auto', mt: 1 }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={itemData.phone}
                            onChange={(e) => {
                                // Only allow digits, +, and -
                                const value = e.target.value;
                                // Regex to match only digits, +, and -
                                if (/^[0-9+\-]*$/.test(value)) {
                                    setItemData(prev => ({ ...prev, phone: value }));
                                }
                            }}
                            required
                            inputProps={{
                                inputMode: 'tel', // Helps show telephone keyboard on mobile
                            }}
                        />
                        <TextField fullWidth label="Address" name="location.address" onChange={handleChange} required />
                        <Input type="file" inputProps={{ multiple: true, accept: 'image/*' }} onChange={handleImageUpload} />
                        <div style={{ height: '400px', width: '100%', marginTop: '20px', position: 'relative' }}>
                            <MapContainer
                                center={[itemData.location.geolocation.latitude, itemData.location.geolocation.longitude]}
                                zoom={17}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[
                                        itemData.location.geolocation.latitude,
                                        itemData.location.geolocation.longitude,
                                    ]}
                                >
                                    <Popup>
                                        Latitude: {itemData.location.geolocation.latitude.toFixed(4)} <br />
                                        Longitude: {itemData.location.geolocation.longitude.toFixed(4)}
                                    </Popup>
                                </Marker>
                                <LocationSelector setItemData={setItemData} />
                                <MoveToCurrentLocation setItemData={setItemData} />
                            </MapContainer>
                        </div>
                        <Button variant="contained" color="primary" type="submit">
                            Add Item
                        </Button>
                    </form>
                </div>
            </div>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AddItemPage;