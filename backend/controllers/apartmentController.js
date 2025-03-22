const Apartment_List = require('../models/apartment_model');
const multer = require('multer');

const get_all_apartments = async (req, res) => {
    try {
        const apartments = await Apartment_List.find();
        res.json(apartments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const add_apartment_test = async (req, res) => {
    const apartment = new Apartment_List({
        apartment_id: req.body.apartment_id,
        title: req.body.title,
        location: req.body.location,
        rent: req.body.rent,
        listing_date: req.body.listing_date,
        status: req.body.status,
        optional_details: req.body.optional_details,
        tenancy_preferences: req.body.tenancy_preferences,
        current_tenants: req.body.current_tenants,
        upvotes: req.body.upvotes,
        images: req.files.map(file => file.buffer)
    });

    try {
        const newApartment = await apartment.save();
        res.status(201).json(newApartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const get_apartment_by_id = async (req, res) => {
    try {
        const apartment = await Apartment_List.findOne({ apartment_id: req.params.apartmentId });

        if (!apartment) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        res.json(apartment);
    } catch (err) {
        console.error('Error fetching apartment details:', err);
        res.status(500).json({ message: err.message });
    }
};

const add_apartment = async (req, res) => {
    try {
        const apartmentData = req.body;

        // Process images: Convert Base64 strings to Buffers
        if (apartmentData.images && apartmentData.images.length > 0) {
            apartmentData.images = apartmentData.images.map(img => ({
                data: Buffer.from(img.data, 'base64'),
                contentType: img.contentType,
                name: img.name || 'image'
            }));
        }

        const apartment = new Apartment_List(apartmentData);
        const newApartment = await apartment.save();
        res.status(201).json(newApartment);
    } catch (err) {
        console.error('Error adding apartment:', err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = { get_all_apartments, add_apartment_test, add_apartment, get_apartment_by_id };
