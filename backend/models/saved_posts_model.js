const mongoose = require('mongoose');

const savedPostsSchema = new mongoose.Schema({
    postId: { type: String, required: true },
    // Store username directly instead of ObjectId reference
    username: { type: String, required: true },
    // Keep the original field for backward compatibility
    saved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        required: true,
        enum: ['apartment', 'marketplace']
    },
    // Store as simple strings without references
    apartment_id: { type: String },
    item_id: { type: String },
    dateSaved: { type: Date, default: Date.now },
});

// Add index for faster lookups by username
savedPostsSchema.index({ username: 1 });
// Add compound index for checking if a post is already saved
savedPostsSchema.index({ username: 1, type: 1, apartment_id: 1 });
savedPostsSchema.index({ username: 1, type: 1, item_id: 1 });

const SavedPosts = mongoose.model('saved_posts', savedPostsSchema);

module.exports = SavedPosts;