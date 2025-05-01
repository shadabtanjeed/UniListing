import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Input,
    IconButton,
    Snackbar
} from '@mui/material';
import AppNavbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api-config';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categories = ['Electronics', 'Furniture', 'Books', 'Clothing', 'Other'];

const EditItemPage = () => {
    const { itemId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [itemData, setItemData] = useState(location.state?.item || {});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

    useEffect(() => {
        if (!itemData._id) {
            fetchItemData();
        } else {
            setLoading(false);
        }
    }, [itemId]);

    const fetchItemData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/items/get_item/${itemId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch item data');
            }

            const data = await response.json();
            setItemData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching item data:', error);
            setError('Failed to fetch item data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setItemData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setItemData(prev => ({ ...prev, [name]: value }));
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
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) {
            alert('Please upload only image files.');
            return;
        }

        const readFiles = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    resolve({
                        contentType: file.type,
                        name: file.name,
                        data: reader.result.split(',')[1]
                    });
                };
                reader.onerror = reject;
            });
        });

        Promise.all(readFiles)
            .then(newImages => {
                setItemData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...newImages]
                }));
            })
            .catch(error => console.error('Error processing images:', error));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/my_posts/edit/${itemId}?type=marketplace`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
            setTimeout(() => navigate('/my_posts'), 2000);
        } catch (error) {
            console.error('Error updating item:', error);
            setSnackbar({ open: true, message: 'Failed to update item', severity: 'error' });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    // Map Components
    const LocationSelector = ({ setItemData }) => {
        useMapEvents({
            click(e) {
                if (e.originalEvent.target.closest('.move-to-current-location-button')) {
                    return;
                }
                const { lat, lng } = e.latlng;
                setItemData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        geolocation: { latitude: lat, longitude: lng }
                    }
                }));
            }
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
                        setItemData(prev => ({
                            ...prev,
                            location: {
                                ...prev.location,
                                geolocation: { latitude, longitude }
                            }
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
                    padding: '8px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
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

    if (loading) return <div>Loading...</div>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
            <AppNavbar />
            <div className="AddItemPage">
                <div className="formContainer">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Edit Item
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={itemData.title || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={itemData.description || ''}
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

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', gap: 2 }}>
                            <TextField
                                sx={{ flex: '0 0 80%' }}
                                label="Price"
                                name="price"
                                type="text"
                                value={itemData.price || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
                                        setItemData(prev => ({ ...prev, price: value }));
                                    }
                                }}
                                required
                                inputProps={{
                                    inputMode: 'decimal'
                                }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="negotiable"
                                        checked={itemData.negotiable || false}
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
                            value={itemData.email || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={itemData.phone || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^[0-9+\-]*$/.test(value)) {
                                    setItemData(prev => ({ ...prev, phone: value }));
                                }
                            }}
                            required
                            inputProps={{
                                inputMode: 'tel'
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Address"
                            name="location.address"
                            value={itemData.location?.address || ''}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="file"
                            inputProps={{ multiple: true, accept: 'image/*' }}
                            onChange={handleImageUpload}
                        />

                        {/* Image Thumbnails */}
                        <div className="imageThumbnails">
                            {itemData.images?.map((image, index) => (
                                <img
                                    key={index}
                                    src={`data:${image.contentType};base64,${image.data}`}
                                    alt={`Uploaded ${index + 1}`}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        margin: '5px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Map */}
                        <div style={{ height: '400px', width: '100%', marginTop: '20px', position: 'relative' }}>
                            <MapContainer
                                center={[
                                    itemData.location?.geolocation?.latitude || 23.9475,
                                    itemData.location?.geolocation?.longitude || 90.3792
                                ]}
                                zoom={17}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[
                                        itemData.location?.geolocation?.latitude || 23.9475,
                                        itemData.location?.geolocation?.longitude || 90.3792
                                    ]}
                                >
                                    <Popup>
                                        Selected Location
                                    </Popup>
                                </Marker>
                                <LocationSelector setItemData={setItemData} />
                                <MoveToCurrentLocation setItemData={setItemData} />
                            </MapContainer>
                        </div>

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Update Item
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
};

export default EditItemPage;