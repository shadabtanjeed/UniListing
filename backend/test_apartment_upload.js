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
                path: './assets/6fb95bdd3adbb4.jpg',
                contentType: 'image/jpeg',
                name: '6fb95bdd3adbb4.jpg'
            },
            {
                path: './assets/39c5554e73ec00.jpg',
                contentType: 'image/jpeg',
                name: '39c5554e73ec00.jpg'
            },
            {
                path: './assets/Apartment-for-sale-in-Mirpur.jpg',
                contentType: 'image/jpeg',
                name: 'Apartment-for-sale-in-Mirpur.jpg'
            }
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
            title: "3 bed apartment for rent in Lalmatia",
            apartment_id: `APT${Date.now().toString().slice(-6)}`, // Generate unique ID
            posted_by: "halum",
            location: {
                address: "Doyel Tower, Block: B, Lalmatiar, Dhaka",
                geolocation: {
                    latitude: 23.8001,
                    longitude: 90.4132
                },
                area: "Mohammadpur",
            },
            bedrooms: {
                total: 3,
                available: 3,
                rooms_for_rent: [1, 2, 3]
            },
            bathrooms: {
                total: 4,
                common: 1
            },
            rent_type: {
                full_apartment: true,
                partial_rent: {
                    enabled: false,
                    rooms_available: 3
                }
            },
            rent: {
                amount: 33000,
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
                name: "Shadab Tanjeed",
                phone: "01712345678",
                email: "testuser@example.com"
            },
            listing_date: new Date().toISOString().split('T')[0],
            status: "available",
            optional_details: {
                furnished: true,
                size: 1500,
                balcony: true,
                more_details: "Lalmatia, home to Shadab Tanjeed. If you want to live in identity crisis thinking whether you are in Mohammadpur or Dhanmondi, this is the place for you. You get both of these worlds in one place. Everything is like super close from here"
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