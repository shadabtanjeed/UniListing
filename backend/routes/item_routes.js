const express = require('express');
const router = express.Router();
const { get_all_items, get_item_by_id, add_item } = require('../controllers/itemController');

// Route to get all items
router.get('/get_items', get_all_items);

// Route to get a specific item by ID
router.get('/get_item/:itemId', get_item_by_id);

// Route to add a new item
router.post('/add-item', add_item);

module.exports = router;