const express = require('express');
const router = express.Router();
const multer = require('multer');
const ApartmentListing = require('../models/apartment_model');

const { get_all_apartments, add_apartment_test, get_apartment_by_id, add_apartment } = require('../controllers/apartmentController');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Get all apartments
router.get('/all_apartments', get_all_apartments);

router.get('/:apartmentId', get_apartment_by_id);


// Add apartment routes
router.post('/add_apartment_test', add_apartment_test);
router.post('/add_apartment', add_apartment);

module.exports = router;