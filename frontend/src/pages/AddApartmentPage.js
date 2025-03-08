import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControlLabel, Checkbox, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../components/Sidebar';
import '../styles/AddApartmentPage.css';
import { v4 as uuidv4 } from 'uuid';

const departments = ['CSE', 'EEE', 'MPE', 'BTM', 'CEE'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function AddApartmentPage() {
    const navigate = useNavigate();
    const generateApartmentId = () => `APT${uuidv4().slice(0, 6)}`;

    const [apartmentData, setApartmentData] = useState({
        title: '',
        posted_by: 'halum', // Need to replace 'halum' with the actual session user
        location: { address: '', geolocation: { latitude: '', longitude: '' }, area: '' },
        bedrooms: { total: '', available: '', rooms_for_rent: [] }, // Initialize as an array
        bathrooms: { total: '', common: '' },
        rent_type: { full_apartment: false, partial_rent: { enabled: false, rooms_available: 0 } },
        rent: { amount: '', negotiable: false },
        utility_bill_included: false,
        amenities: { gas: false, lift: false, generator: false, parking: false, security: false },
        images: [],
        contact_info: { name: '', phone: '', email: '' },
        optional_details: { furnished: false, size: '', balcony: false, more_details: '' },
        tenancy_preferences: { preferred_tenants: '', preferred_dept: '', preferred_semester: '' },
        current_tenants: { total: '', details: [] },
        upvotes: { count: 0, users: [] },
        status: 'available'
    });

    useEffect(() => {
        setApartmentData(prev => ({ ...prev, apartment_id: generateApartmentId() }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApartmentData({ ...apartmentData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;

        // Ensure that only one rent type checkbox is selected at a time
        if (name === "rent_type.full_apartment") {
            setApartmentData(prev => ({
                ...prev,
                rent_type: { full_apartment: checked, partial_rent: { enabled: !checked, rooms_available: 0 } }
            }));
        } else if (name === "rent_type.partial_rent.enabled") {
            setApartmentData(prev => ({
                ...prev,
                rent_type: { full_apartment: !checked, partial_rent: { enabled: checked, rooms_available: 0 } }
            }));
        } else {
            setApartmentData({ ...apartmentData, [name]: checked });
        }
    };



    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));

        const readFiles = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    resolve({
                        contentType: file.type,
                        name: file.name,
                        data: reader.result.split(',')[1] // Extract Base64 part
                    });
                };
                reader.onerror = reject;
            });
        });

        Promise.all(readFiles)
            .then(images => {
                setApartmentData(prev => ({ ...prev, images }));
                console.log("Images processed successfully:", images.length);
            })
            .catch(error => console.error("Error processing images:", error));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert numeric values to numbers
        const dataToSend = {
            ...apartmentData,
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
                rooms_for_rent: apartmentData.bedrooms.rooms_for_rent.map(Number),  // Ensure it's an array of numbers
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
            status: apartmentData.status || 'available',  // Ensure valid status
        };

        // Send the request
        fetch('http://localhost:5000/api/apartments/add_apartment', {
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
                navigate('/view-apartments');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add apartment');
            });
    };


    return (
        <>
            <AppSidebar />
            <div className="AddApartmentPage">
                <div className="formContainer">
                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Title" name="title" onChange={handleChange} required />
                        <TextField fullWidth label="Address" name="location.address" onChange={handleChange} required />
                        <TextField fullWidth label="Area" name="location.area" onChange={handleChange} required />
                        <TextField fullWidth label="Latitude" name="location.geolocation.latitude" onChange={handleChange} />
                        <TextField fullWidth label="Longitude" name="location.geolocation.longitude" onChange={handleChange} />
                        <TextField fullWidth label="Total Bedrooms" name="bedrooms.total" type="number" onChange={handleChange} required />
                        <TextField fullWidth label="Available Bedrooms" name="bedrooms.available" type="number" onChange={handleChange} required inputProps={{ max: apartmentData.bedrooms.total }} />
                        <TextField fullWidth label="Rooms for Rent" name="bedrooms.rooms_for_rent" type="number" onChange={handleChange} inputProps={{ max: apartmentData.bedrooms.available }} />
                        <TextField fullWidth label="Total Bathrooms" name="bathrooms.total" type="number" onChange={handleChange} required />
                        <TextField fullWidth label="Common Bathrooms" name="bathrooms.common" type="number" onChange={handleChange} required inputProps={{ max: apartmentData.bathrooms.total }} />

                        <FormControlLabel
                            control={<Checkbox
                                name="rent_type.full_apartment"
                                checked={apartmentData.rent_type.full_apartment}
                                onChange={handleCheckboxChange}
                            />}
                            label="Full Apartment for Rent"
                        />

                        <FormControlLabel control={<Checkbox
                            name="rent_type.partial_rent.enabled"
                            checked={apartmentData.rent_type.partial_rent.enabled}
                            onChange={handleCheckboxChange}
                        />}
                            label="Partial Rent Available"
                        />


                        <TextField fullWidth label="Rent Amount" name="rent.amount" type="number" onChange={handleChange} required />
                        <FormControlLabel control={<Checkbox name="rent.negotiable" onChange={handleCheckboxChange} />} label="Negotiable" />
                        <FormControlLabel control={<Checkbox name="utility_bill_included" onChange={handleCheckboxChange} />} label="Utility Bill Included" />

                        <TextField select fullWidth label="Preferred Department" name="tenancy_preferences.preferred_dept" onChange={handleChange} required>
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                        <TextField select fullWidth label="Preferred Semester" name="tenancy_preferences.preferred_semester" onChange={handleChange} required>
                            {semesters.map((sem) => (
                                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
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

                        <Input type="file" inputProps={{ multiple: true, accept: 'image/*' }} onChange={handleImageUpload} />
                        <Button className="sendButton" variant="contained" color="primary" type="submit">Add</Button>
                    </form>
                </div>
                <div className="sideContainer"></div>
            </div>
        </>
    );
}

export default AddApartmentPage;
