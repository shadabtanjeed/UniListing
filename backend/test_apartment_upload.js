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
            {
                path: './assets/la_1.jpeg',
                contentType: 'image/jpeg',
                name: '6fb95bdd3adbb4.jpg'
            },
            {
                path: './assets/la_2.jpg',
                contentType: 'image/jpeg',
                name: '39c5554e73ec00.jpg'
            },
            {
                path: './assets/la_3.jpg',
                contentType: 'image/jpeg',
                name: 'Apartment-for-sale-in-Mirpur.jpg'
            },
            {
                path: './assets/la_4.jpeg',
                contentType: 'image/jpeg',
                name: 'Apartment-for-sale-in-Mirpur.jpg'
            },
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
            title: "Duplex House for rent in Tejgaon",
            apartment_id: `APT${Date.now().toString().slice(-6)}`, // Generate unique ID
            posted_by: "Shadab Tanjeed",
            location: {
                address: "3/4, Maisun Mansion, Tejgaon, Dhaka",
                geolocation: {
                    latitude: 23.8001,
                    longitude: 90.4132
                },
                area: "Tejgaon",
            },
            bedrooms: {
                total: 8,
                available: 8,
                rooms_for_rent: [1, 2, 3, 4, 5, 6, 7, 8]
            },
            bathrooms: {
                total: 12,
                common: 10
            },
            rent_type: {
                full_apartment: true,
                partial_rent: {
                    enabled: false,
                    rooms_available: 8
                }
            },
            rent: {
                amount: 530000,
                negotiable: true
            },
            utility_bill_included: false,
            amenities: {
                gas: true,
                lift: false,
                generator: true,
                parking: true,
                security: false
            },
            images: images, // Add the images we read
            contact_info: {
                name: "Shadab Tanjeed",
                phone: "01712345678",
                email: "shadabtanjeed@example.com"
            },
            listing_date: new Date().toISOString().split('T')[0],
            status: "available",
            optional_details: {
                furnished: false,
                size: 12589,
                balcony: true,
                more_details: "Super luxurious duplex house with 8 bedrooms, 12 bathrooms, 3 kitchens, 2 living rooms, 2 dining rooms, 2 servant rooms, 2 parking spaces, and a rooftop garden. From your bedroom, you can see the beautiful Hatirjheel lake. The house is located in a quiet residential area, close to the main road and shopping centers."
            },
            tenancy_preferences: {
                preferred_tenants: 3,
                preferred_dept: ["CSE", "EEE"],
                preferred_semester: ["6th", "7th", "8th"]
            },
            current_tenants: {
                total: 2,
                details: [
                    {
                        department: "BBA",
                        semester: "7th"
                    },
                    {
                        department: "CSE",
                        semester: "8th"
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