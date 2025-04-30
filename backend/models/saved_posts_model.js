const mongoose = require('mongoose');

const savedPostsSchema = new mongoose.Schema({
    postId: { type: String, required: true },
    saved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: ['apartment', 'marketplace']
    },
    apartment_id: { type: String, ref: 'apt_listings' },
    item_id: { type: String, ref: 'item_listings' },
    dateSaved: { type: Date, default: Date.now },
});

const SavedPosts = mongoose.model('saved_posts', savedPostsSchema);

module.exports = SavedPosts;
