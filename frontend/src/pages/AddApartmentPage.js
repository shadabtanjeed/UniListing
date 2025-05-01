import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, MenuItem, FormControlLabel, Checkbox, Input, IconButton, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/HomePage/Navbar'; 
import '../styles/AddApartmentPage.css';
import { v4 as uuidv4 } from 'uuid';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from 'axios'; // Import axios for API calls
import { API_BASE_URL } from '../config/api-config';
import CloseIcon from '@mui/icons-material/Close'; // Add this import

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const departments = ['CSE', 'EEE', 'MPE', 'BTM', 'CEE'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function AddApartmentPage() {
    const navigate = useNavigate();
    const generateApartmentId = () => `APT${uuidv4().slice(0, 6)}`;

    const [apartmentData, setApartmentData] = useState({
        title: '',
        posted_by: '', // Initially empty, will be set dynamically
        location: { address: '', geolocation: { latitude: 23.9475, longitude: 90.3792 }, area: '' }, // Default to IUT
        bedrooms: { total: '', available: '', rooms_for_rent: [] },
        bathrooms: { total: '', common: '' },
        rent_type: { full_apartment: true, partial_rent: { enabled: false, rooms_available: 0 } },
        rent: { amount: '', negotiable: false },
        utility_bill_included: false,
        amenities: { gas: false, lift: false, generator: false, parking: false, security: false },
        images: [],
        contact_info: { name: '', phone: '', email: '' },
        optional_details: { furnished: false, size: '', balcony: false, more_details: '' },
        tenancy_preferences: {
            preferred_tenants: '',
            preferred_dept: [], // Change to array
            preferred_semester: [] // Change to array
        },
        current_tenants: { total: '', details: [] },
        upvotes: { count: 0, users: [] },
        status: 'available'
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const [areas, setAreas] = useState([]); // State to store the list of areas

    // Add a reference to the file input
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Fetch the username from the session
        const fetchUsername = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/session`, {
                    withCredentials: true // Include credentials (cookies)
                });
                setApartmentData(prev => ({
                    ...prev,
                    posted_by: response.data.username
                }));
                // console.log(response.data.username);
            } catch (error) {
                console.error('Error fetching username:', error);
                if (error.response && error.response.status === 401) {
                    // Redirect to login if not authenticated
                    navigate('/login');
                }
            }
        };

        // Fetch the areas from the text file
        const fetchAreas = async () => {
            try {
                const response = await axios.get('/assets/dhaka_areas.txt'); // Adjust the path if necessary
                const areaList = response.data.split('\n').map(area => area.trim()); // Parse the file content
                setAreas(areaList);
            } catch (error) {
                console.error('Error fetching areas:', error);
            }
        };

        fetchUsername();
        fetchAreas();
        setApartmentData(prev => ({ ...prev, apartment_id: generateApartmentId() }));
    }, [navigate]);

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
        // Regular handling for other nested fields
        else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setApartmentData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        }
        // Regular handling for top-level fields
        else {
            setApartmentData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;

        if (name === "rent_type.partial_rent.enabled") {
            setApartmentData(prev => ({
                ...prev,
                rent_type: {
                    full_apartment: !checked, // Automatically set full_apartment to false when partial_rent is enabled
                    partial_rent: { enabled: checked, rooms_available: 0 }
                }
            }));
        } else {
            setApartmentData(prev => ({ ...prev, [name]: checked }));
        }
    };

    // Add this function to create a new DataTransfer with remaining files
    const updateFileInput = (remainingImagesCount) => {
        // Create a new DataTransfer object
        const dataTransfer = new DataTransfer();

        // Create a new File object for each remaining image
        for (let i = 0; i < remainingImagesCount; i++) {
            const file = new File([""], `image${i}`, {
                type: "image/jpeg",
            });
            dataTransfer.items.add(file);
        }

        // Update the file input's files
        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
        }
    };

    // Update the handleRemoveImage function
    const handleRemoveImage = (indexToRemove) => {
        setApartmentData(prev => {
            const newImages = prev.images.filter((_, index) => index !== indexToRemove);
            // Update the file input to reflect the new number of images
            updateFileInput(newImages.length);
            return {
                ...prev,
                images: newImages
            };
        });
    };

    // Update the handleImageUpload function
    const handleImageUpload = (e) => {
        const input = e.target;
        const files = Array.from(input.files).filter(file => file.type.startsWith('image/'));

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
                setApartmentData(prev => {
                    const updatedImages = [...prev.images, ...newImages];
                    // Update the file input to reflect the total number of images
                    updateFileInput(updatedImages.length);
                    return {
                        ...prev,
                        images: updatedImages
                    };
                });
            })
            .catch(error => console.error("Error processing images:", error));
    };

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: '', severity: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Transform the images array for the backend
        const transformedImages = apartmentData.images.map(image => ({
            data: image.data, // Base64 data (already without the prefix)
            contentType: image.contentType, // MIME type (e.g., image/jpeg)
            name: image.name // File name
        }));

        const dataToSend = {
            ...apartmentData,
            images: transformedImages, // Use the transformed images array
            location: {
                ...apartmentData.location,
                geolocation: {
                    latitude: Number(apartmentData.location.geolocation.latitude),
                    longitude: Number(apartmentData.location.geolocation.longitude),
                }
            },
            bedrooms: {
                ...apartmentData.bedrooms,
                total: Number(apartmentData.bedrooms.total),
                available: Number(apartmentData.bedrooms.available),
                rooms_for_rent: apartmentData.bedrooms.rooms_for_rent.map(Number),
            },
            bathrooms: {
                ...apartmentData.bathrooms,
                total: Number(apartmentData.bathrooms.total),
                common: Number(apartmentData.bathrooms.common),
            },
            rent: {
                ...apartmentData.rent,
                amount: Number(apartmentData.rent.amount),
            },
            rent_type: {
                ...apartmentData.rent_type,
                full_apartment: apartmentData.rent_type.full_apartment || false,
                partial_rent: {
                    enabled: apartmentData.rent_type.partial_rent.enabled || false,
                    rooms_available: apartmentData.rent_type.partial_rent.rooms_available || 0,
                }
            },
            tenancy_preferences: {
                ...apartmentData.tenancy_preferences,
                preferred_dept: Array.isArray(apartmentData.tenancy_preferences.preferred_dept)
                    ? apartmentData.tenancy_preferences.preferred_dept
                    : [],
                preferred_semester: Array.isArray(apartmentData.tenancy_preferences.preferred_semester)
                    ? apartmentData.tenancy_preferences.preferred_semester
                    : []
            },
            status: apartmentData.status || 'available',
        };

        // Send the request
        fetch(`${API_BASE_URL}/api/apartments/add_apartment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add apartment');
                }
                return response.json();
            })
            .then(data => {
                console.log('Apartment added:', data);
                setSnackbar({
                    open: true,
                    message: 'Apartment added successfully!',
                    severity: 'success'
                });
                setTimeout(() => navigate('/view-apartments'), 2000); // Delay navigation
            })
            .catch(error => {
                console.error('Error:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to add apartment',
                    severity: 'error'
                });
            });
    };

    // Component to handle map events
    const LocationSelector = ({ setApartmentData }) => {
        useMapEvents({
            click(e) {
                // Ignore clicks originating from the "Move to Current Location" button
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
            event.stopPropagation(); // Prevent map click event

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        // Update the map view
                        map.flyTo([latitude, longitude], 17);

                        // Update the apartmentData state
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
            <IconButton
                className="move-to-current-location-button" // Add a unique class name
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 400, // Lower than sidebar but higher than map
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

    return (
        <>
            <Navbar />
            <div className="AddApartmentPage">
                <div className="formContainer">
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Title" name="title" onChange={handleChange} required />
                        <TextField fullWidth label="Address" name="location.address" onChange={handleChange} required />
                        <TextField
                            select
                            fullWidth
                            label="Area"
                            name="location.area"
                            value={apartmentData.location.area || ''} // Fallback to empty string
                            onChange={handleChange}
                            required
                        >
                            {areas.map((area, index) => (
                                <MenuItem key={index} value={area}>
                                    {area}
                                </MenuItem>
                            ))}
                        </TextField>


                        {/* Mandatory Details Field */}
                        <TextField
                            fullWidth
                            label="Details (Description)"
                            name="optional_details.more_details"
                            multiline
                            rows={4} // Allow multiple lines for the description
                            onChange={handleChange}
                            required // Make this field mandatory
                        />
                        {/* Optional Size Field */}
                        <TextField
                            fullWidth
                            label="Size (Square Feet)"
                            name="optional_details.size"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Restrict input to numbers
                        />
                        <TextField
                            fullWidth
                            label="Total Bedrooms"
                            name="bedrooms.total"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Restrict input to numbers
                            required
                        />

                        {/* <TextField
                            fullWidth
                            label="Available Bedrooms"
                            name="bedrooms.available"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', max: apartmentData.bedrooms.total }} // Restrict input to numbers
                            required
                        /> */}

                        {/* <TextField
                            fullWidth
                            label="Rooms for Rent"
                            name="bedrooms.rooms_for_rent"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', max: apartmentData.bedrooms.available }} // Restrict input to numbers
                        />
 */}


                        {/* <FormControlLabel
                            control={<Checkbox
                                name="rent_type.full_apartment"
                                checked={apartmentData.rent_type.full_apartment}
                                onChange={handleCheckboxChange}
                            />}
                            label="Full Apartment for Rent"
                        /> */}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="rent_type.partial_rent.enabled"
                                    checked={apartmentData.rent_type.partial_rent.enabled}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Partial Rent Available"
                        />

                        {/* Conditionally render the Available Bedrooms field */}
                        {apartmentData.rent_type.partial_rent.enabled && (
                            <TextField
                                fullWidth
                                label="Available Bedrooms"
                                name="bedrooms.available"
                                type="number"
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                                onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-'].includes(e.key)) {
                                        e.preventDefault(); // Block invalid characters
                                    }
                                }}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', max: apartmentData.bedrooms.total }} // Restrict input to numbers
                                required
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Total Bathrooms"
                            name="bathrooms.total"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Restrict input to numbers
                            required
                        />

                        <TextField
                            fullWidth
                            label="Common Bathrooms"
                            name="bathrooms.common"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', max: apartmentData.bathrooms.total }} // Restrict input to numbers
                            required
                        />

                        <TextField
                            fullWidth
                            label="Rent Amount"
                            name="rent.amount"
                            type="number"
                            onChange={handleChange}
                            onWheel={(e) => e.target.blur()} // Prevent mouse wheel scrolling
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                    e.preventDefault(); // Block invalid characters
                                }
                            }}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Restrict input to numbers
                            required
                        />
                        <FormControlLabel control={<Checkbox name="rent.negotiable" onChange={handleCheckboxChange} />} label="Negotiable" />
                        <FormControlLabel control={<Checkbox name="utility_bill_included" onChange={handleCheckboxChange} />} label="Utility Bill Included" />

                        <TextField
                            select
                            fullWidth
                            label="Preferred Department"
                            name="tenancy_preferences.preferred_dept"
                            value={apartmentData.tenancy_preferences.preferred_dept || []}
                            onChange={handleChange}
                            SelectProps={{
                                multiple: true
                            }}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                    {dept}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Preferred Semester"
                            name="tenancy_preferences.preferred_semester"
                            value={apartmentData.tenancy_preferences.preferred_semester || []}
                            onChange={handleChange}
                            SelectProps={{
                                multiple: true
                            }}
                        >
                            {semesters.map((sem) => (
                                <MenuItem key={sem} value={sem}>
                                    {sem}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Email"
                            name="contact_info.email"
                            type="email" // Use type="email" for automatic email validation
                            onChange={handleChange}
                            required
                        />
                        <TextField fullWidth label="Phone" name="contact_info.phone" onChange={handleChange} required />
                        <TextField fullWidth label="Contact Name" name="contact_info.name" onChange={handleChange} required />

                        <FormControlLabel control={<Checkbox name="amenities.gas" onChange={handleCheckboxChange} />} label="Gas" />
                        <FormControlLabel control={<Checkbox name="amenities.lift" onChange={handleCheckboxChange} />} label="Lift" />
                        <FormControlLabel control={<Checkbox name="amenities.generator" onChange={handleCheckboxChange} />} label="Generator" />
                        <FormControlLabel control={<Checkbox name="amenities.parking" onChange={handleCheckboxChange} />} label="Parking" />
                        <FormControlLabel control={<Checkbox name="amenities.security" onChange={handleCheckboxChange} />} label="Security" />

                        {/* Update the Input component in your JSX */}
                        <Input
                            type="file"
                            inputRef={fileInputRef}
                            inputProps={{
                                multiple: true,
                                accept: 'image/*'
                            }}
                            onChange={handleImageUpload}
                        />

                        {/* Thumbnails Section */}
                        <div className="imageThumbnails">
                            {apartmentData.images.map((image, index) => (
                                <div
                                    key={index}
                                    style={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        margin: '5px'
                                    }}
                                >
                                    <img
                                        src={`data:${image.contentType};base64,${image.data}`} // Construct the full Base64 URL
                                        alt={`Uploaded ${index + 1}`}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc'
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveImage(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: -6,
                                            right: -6,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            width: '20px',
                                            height: '20px',
                                            padding: 0,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                            }
                                        }}
                                    >
                                        <CloseIcon
                                            sx={{
                                                fontSize: '14px',
                                                color: 'white',
                                                '&:hover': {
                                                    color: '#ff4444'
                                                }
                                            }}
                                        />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '400px', width: '100%', marginTop: '20px', position: 'relative' }}>
                            <MapContainer
                                center={[apartmentData.location.geolocation.latitude, apartmentData.location.geolocation.longitude]} // Default center
                                zoom={17}
                                style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[apartmentData.location.geolocation.latitude, apartmentData.location.geolocation.longitude]}>
                                    <Popup>
                                        Latitude: {apartmentData.location.geolocation.latitude.toFixed(4)} <br />
                                        Longitude: {apartmentData.location.geolocation.longitude.toFixed(4)}
                                    </Popup>
                                </Marker>
                                <LocationSelector setApartmentData={setApartmentData} />
                                <MoveToCurrentLocation setApartmentData={setApartmentData} />
                            </MapContainer>
                        </div>



                        <Button className="sendButton" variant="contained" color="primary" type="submit">Add</Button>
                    </form>
                </div>
                <div className="sideContainer"></div>
            </div>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AddApartmentPage;
