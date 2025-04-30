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
    Input
} from '@mui/material';
import AppSidebar from '../components/Sidebar';
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

const departments = ['CSE', 'EEE', 'MPE', 'BTM', 'CEE'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const EditApartmentPage = () => {
    const { apartmentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [apartmentData, setApartmentData] = useState(location.state?.apartment || {});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        if (!apartmentData._id) {
            fetchApartmentData();
        } else {
            setLoading(false);
        }
        fetchAreas();
    }, [apartmentId]);

    const fetchAreas = async () => {
        try {
            const response = await fetch('/assets/dhaka_areas.txt');
            const text = await response.text();
            const areaList = text.split('\n').map(area => area.trim());
            setAreas(areaList);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const fetchApartmentData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch apartment data');
            }
            
            const data = await response.json();
            
            // Ensure preferred_dept and preferred_semester are arrays
            const formattedData = {
                ...data,
                tenancy_preferences: {
                    ...data.tenancy_preferences,
                    preferred_dept: Array.isArray(data.tenancy_preferences?.preferred_dept) 
                        ? data.tenancy_preferences.preferred_dept 
                        : data.tenancy_preferences?.preferred_dept 
                            ? [data.tenancy_preferences.preferred_dept] 
                            : [],
                    preferred_semester: Array.isArray(data.tenancy_preferences?.preferred_semester)
                        ? data.tenancy_preferences.preferred_semester
                        : data.tenancy_preferences?.preferred_semester
                            ? [data.tenancy_preferences.preferred_semester]
                            : []
                }
            };
            
            setApartmentData(formattedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching apartment data:', error);
            setError('Failed to fetch apartment data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for preferred_dept and preferred_semester
        if (name === 'tenancy_preferences.preferred_dept' || name === 'tenancy_preferences.preferred_semester') {
            const [parent, child] = name.split('.');
            setApartmentData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: Array.isArray(value) ? value : [value] // Ensure value is always an array
                }
            }));
        }
        // Regular handling for other fields
        else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setApartmentData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setApartmentData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === "rent_type.partial_rent.enabled") {
            setApartmentData(prev => ({
                ...prev,
                rent_type: {
                    full_apartment: !checked,
                    partial_rent: { enabled: checked, rooms_available: 0 }
                }
            }));
        } else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setApartmentData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: checked
                }
            }));
        } else {
            setApartmentData(prev => ({ ...prev, [name]: checked }));
        }
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
                setApartmentData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                }));
            })
            .catch(error => console.error("Error processing images:", error));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/my_posts/edit/${apartmentId}?type=apartment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(apartmentData)
            });

            if (!response.ok) {
                throw new Error('Failed to update apartment');
            }

            alert('Apartment updated successfully');
            navigate('/my_posts');
        } catch (error) {
            console.error('Error updating apartment:', error);
            setError('Failed to update apartment');
        }
    };

    // Map Components
    const LocationSelector = ({ setApartmentData }) => {
        useMapEvents({
            click(e) {
                if (e.originalEvent.target.closest('.move-to-current-location-button')) {
                    return;
                }
                const { lat, lng } = e.latlng;
                setApartmentData(prev => ({
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

    const MoveToCurrentLocation = ({ setApartmentData }) => {
        const map = useMap();
        const handleMoveToCurrentLocation = (event) => {
            event.stopPropagation();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        map.flyTo([latitude, longitude], 17);
                        setApartmentData(prev => ({
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
            <Button
                className="move-to-current-location-button"
                variant="contained"
                onClick={handleMoveToCurrentLocation}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000
                }}
            >
                <MyLocationIcon />
            </Button>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
            <AppSidebar />
            <div className="AddApartmentPage">
                <div className="formContainer">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Edit Apartment
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <TextField 
                            fullWidth 
                            label="Title" 
                            name="title" 
                            value={apartmentData.title || ''} 
                            onChange={handleChange} 
                            required 
                        />
                        
                        {/* Location Fields */}
                        <TextField 
                            fullWidth 
                            label="Address" 
                            name="location.address" 
                            value={apartmentData.location?.address || ''} 
                            onChange={handleChange} 
                            required 
                        />
                        
                        <TextField
                            select
                            fullWidth
                            label="Area"
                            name="location.area"
                            value={apartmentData.location?.area || ''}
                            onChange={handleChange}
                            required
                        >
                            {areas.map((area, index) => (
                                <MenuItem key={index} value={area}>{area}</MenuItem>
                            ))}
                        </TextField>

                        {/* Details Fields */}
                        <TextField
                            fullWidth
                            label="Details (Description)"
                            name="optional_details.more_details"
                            multiline
                            rows={4}
                            value={apartmentData.optional_details?.more_details || ''}
                            onChange={handleChange}
                            required
                        />

                        {/* Size */}
                        <TextField
                            fullWidth
                            label="Size (Square Feet)"
                            name="optional_details.size"
                            type="number"
                            value={apartmentData.optional_details?.size || ''}
                            onChange={handleChange}
                        />

                        {/* Bedrooms */}
                        <TextField
                            fullWidth
                            label="Total Bedrooms"
                            name="bedrooms.total"
                            type="number"
                            value={apartmentData.bedrooms?.total || ''}
                            onChange={handleChange}
                            required
                        />

                        {/* Partial Rent Option */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="rent_type.partial_rent.enabled"
                                    checked={apartmentData.rent_type?.partial_rent?.enabled || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Partial Rent Available"
                        />

                        {apartmentData.rent_type?.partial_rent?.enabled && (
                            <TextField
                                fullWidth
                                label="Available Bedrooms"
                                name="bedrooms.available"
                                type="number"
                                value={apartmentData.bedrooms?.available || ''}
                                onChange={handleChange}
                                required
                            />
                        )}

                        {/* Bathrooms */}
                        <TextField
                            fullWidth
                            label="Total Bathrooms"
                            name="bathrooms.total"
                            type="number"
                            value={apartmentData.bathrooms?.total || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Common Bathrooms"
                            name="bathrooms.common"
                            type="number"
                            value={apartmentData.bathrooms?.common || ''}
                            onChange={handleChange}
                            required
                        />

                        {/* Rent Information */}
                        <TextField
                            fullWidth
                            label="Rent Amount"
                            name="rent.amount"
                            type="number"
                            value={apartmentData.rent?.amount || ''}
                            onChange={handleChange}
                            required
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="rent.negotiable"
                                    checked={apartmentData.rent?.negotiable || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Negotiable"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="utility_bill_included"
                                    checked={apartmentData.utility_bill_included || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Utility Bill Included"
                        />

                        {/* Preferences */}
                        <TextField
                            select
                            fullWidth
                            label="Preferred Department"
                            name="tenancy_preferences.preferred_dept"
                            value={apartmentData.tenancy_preferences?.preferred_dept || []} // Change to array
                            onChange={handleChange}
                            SelectProps={{
                                multiple: true // Enable multiple selection
                            }}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Preferred Semester"
                            name="tenancy_preferences.preferred_semester"
                            value={apartmentData.tenancy_preferences?.preferred_semester || []} // Change to array
                            onChange={handleChange}
                            SelectProps={{
                                multiple: true // Enable multiple selection
                            }}
                        >
                            {semesters.map((sem) => (
                                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                            ))}
                        </TextField>

                        {/* Contact Information */}
                        <TextField
                            fullWidth
                            label="Email"
                            name="contact_info.email"
                            type="email"
                            value={apartmentData.contact_info?.email || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Phone"
                            name="contact_info.phone"
                            value={apartmentData.contact_info?.phone || ''}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Contact Name"
                            name="contact_info.name"
                            value={apartmentData.contact_info?.name || ''}
                            onChange={handleChange}
                            required
                        />

                        {/* Amenities */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.gas"
                                    checked={apartmentData.amenities?.gas || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Gas"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.lift"
                                    checked={apartmentData.amenities?.lift || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Lift"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.generator"
                                    checked={apartmentData.amenities?.generator || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Generator"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.parking"
                                    checked={apartmentData.amenities?.parking || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Parking"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="amenities.security"
                                    checked={apartmentData.amenities?.security || false}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Security"
                        />

                        {/* Image Upload */}
                        <Input
                            type="file"
                            inputProps={{ multiple: true, accept: 'image/*' }}
                            onChange={handleImageUpload}
                        />

                        {/* Image Thumbnails */}
                        <div className="imageThumbnails">
                            {apartmentData.images?.map((image, index) => (
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
                                    apartmentData.location?.geolocation?.latitude || 23.9475,
                                    apartmentData.location?.geolocation?.longitude || 90.3792
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
                                        apartmentData.location?.geolocation?.latitude || 23.9475,
                                        apartmentData.location?.geolocation?.longitude || 90.3792
                                    ]}
                                >
                                    <Popup>
                                        Selected Location
                                    </Popup>
                                </Marker>
                                <LocationSelector setApartmentData={setApartmentData} />
                                <MoveToCurrentLocation setApartmentData={setApartmentData} />
                            </MapContainer>
                        </div>

                        {/* Submit Button */}
                        <Button
                            className="sendButton"
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Update Apartment
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditApartmentPage;