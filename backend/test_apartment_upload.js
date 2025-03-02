const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Apartment_List = require('./models/apartment_model');
const { title } = require('process');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.mongodb_url)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to read image files and create apartment with them
const createTestApartment = async () => {
    try {
        // Read the image files
        const imageFiles = [
            // {
            //     path: './assets/6fb95bdd3adbb4.jpg',
            //     contentType: 'image/jpeg',
            //     name: '6fb95bdd3adbb4.jpg'
            // },
            {
                path: './assets/39c5554e73ec00.jpg',
                contentType: 'image/jpeg',
                name: '39c5554e73ec00.jpg'
            },
            // {
            //     path: './assets/Apartment-for-sale-in-Mirpur.jpg',
            //     contentType: 'image/jpeg',
            //     name: 'Apartment-for-sale-in-Mirpur.jpg'
            // }
        ];

        // Read all images and convert to binary data
        const images = [];
        for (const file of imageFiles) {
            const data = fs.readFileSync(file.path);
            images.push({
                data: data,
                contentType: file.contentType,
                name: file.name
            });
        }

        // Create a dummy apartment object
        const apartment = new Apartment_List({
            title: "Luxurious Apartment in Banani",
            apartment_id: `APT${Date.now().toString().slice(-6)}`, // Generate unique ID
            posted_by: "test_user",
            location: {
                address: "House 123, Road 456, Banani",
                geolocation: {
                    latitude: 23.8001,
                    longitude: 90.4132
                },
                area: "Banani"
            },
            bedrooms: {
                total: 2,
                available: 2,
                rooms_for_rent: [1, 2]
            },
            bathrooms: {
                total: 1,
                common: 1
            },
            rent_type: {
                full_apartment: false,
                partial_rent: {
                    enabled: true,
                    rooms_available: 1
                }
            },
            rent: {
                amount: 63000,
                negotiable: true
            },
            utility_bill_included: true,
            amenities: {
                gas: true,
                lift: true,
                generator: true,
                parking: true,
                security: true
            },
            images: images, // Add the images we read
            contact_info: {
                name: "Test User",
                phone: "01712345678",
                email: "testuser@example.com"
            },
            listing_date: new Date().toISOString().split('T')[0],
            status: "available",
            optional_details: {
                furnished: true,
                size: 1500,
                balcony: true,
                more_details: "One of the best houses in Banani. Iftikhr Zakir onces stayed as a guest in this flat. Do not miss this"
            },
            tenancy_preferences: {
                preferred_tenants: 2,
                preferred_dept: ["CSE", "EEE"],
                preferred_semester: ["6th", "7th", "8th"]
            },
            current_tenants: {
                total: 1,
                details: [
                    {
                        department: "BBA",
                        semester: "7th"
                    }
                ]
            },
            upvotes: {
                count: 0,
                users: []
            }
        });

        // Save the apartment
        const savedApartment = await apartment.save();
        console.log('Test apartment created successfully:');
        console.log(JSON.stringify({
            apartment_id: savedApartment.apartment_id,
            location: savedApartment.location,
            bedrooms: savedApartment.bedrooms,
            images_count: savedApartment.images.length
        }, null, 2));

    } catch (err) {
        console.error('Error creating test apartment:', err.message);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

// Run the function
createTestApartment();