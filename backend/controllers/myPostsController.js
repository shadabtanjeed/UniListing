const Apartment = require('../models/apartment_model');
const Item = require('../models/item_model');

const myPostsController = {
    getMyPosts: async (req, res) => {
        try {
            const userId = req.user.id;
            const apartments = await Apartment.find({ posted_by: req.user.username });
            const items = await Item.find({ posted_by: req.user.username });
            
            res.json({ apartments, items });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMyPostsByType: async (req, res) => {
        try {
            const { type } = req.params;

            if (type === 'apartment') {
                const posts = await Apartment.find({ posted_by: req.user.username });
                res.json(posts);
            } else if (type === 'marketplace') {
                const posts = await Item.find({ posted_by: req.user.username });
                res.json(posts);
            } else {
                res.status(400).json({ message: 'Invalid post type' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    editPost: async (req, res) => {
        try {
            const { type } = req.query;
            const { postId } = req.params;

            if (type === 'apartment') {
                const apartment = await Apartment.findOneAndUpdate(
                    { _id: postId, posted_by: req.user.username },
                    req.body,
                    { new: true }
                );
                if (!apartment) {
                    return res.status(404).json({ message: 'Apartment not found or unauthorized' });
                }
                res.json(apartment);
            } else if (type === 'marketplace') {
                const item = await Item.findOneAndUpdate(
                    { _id: postId, posted_by: req.user.username },
                    req.body,
                    { new: true }
                );
                if (!item) {
                    return res.status(404).json({ message: 'Item not found or unauthorized' });
                }
                res.json(item);
            } else {
                res.status(400).json({ message: 'Invalid post type' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { type } = req.query;
            const { postId } = req.params;

            if (type === 'apartment') {
                const apartment = await Apartment.findOneAndDelete({ 
                    _id: postId, 
                    posted_by: req.user.username 
                });
                if (!apartment) {
                    return res.status(404).json({ message: 'Apartment not found or unauthorized' });
                }
                res.json({ message: 'Apartment deleted successfully' });
            } else if (type === 'marketplace') {
                const item = await Item.findOneAndDelete({ 
                    _id: postId, 
                    posted_by: req.user.username 
                });
                if (!item) {
                    return res.status(404).json({ message: 'Item not found or unauthorized' });
                }
                res.json({ message: 'Item deleted successfully' });
            } else {
                res.status(400).json({ message: 'Invalid post type' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = myPostsController;