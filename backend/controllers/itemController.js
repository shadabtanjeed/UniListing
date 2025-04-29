const Item_List = require('../models/item_model');

const get_all_items = async (req, res) => {
    try {
        const items = await Item_List.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const get_item_by_id = async (req, res) => {
    try {
        const item = await Item_List.findOne({ item_id: req.params.itemId });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (err) {
        console.error('Error fetching item details:', err);
        res.status(500).json({ message: err.message });
    }
};

const add_item = async (req, res) => {
    try {
        const itemData = req.body;

        // Process images: Convert Base64 strings to Buffers
        if (itemData.images && itemData.images.length > 0) {
            itemData.images = itemData.images.map(img => ({
                data: Buffer.from(img.data, 'base64'),
                contentType: img.contentType,
                name: img.name || 'image'
            }));
        }

        const item = new Item_List(itemData);
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Error adding item:', err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = { get_all_items, get_item_by_id, add_item };