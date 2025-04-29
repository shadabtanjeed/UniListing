const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    data: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    name: {
        type: String
    }
});

const ItemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    item_id: {
        type: String,
        required: true,
        unique: true
    },
    posted_by: {
        type: String,
        required: true
    },
    email: { // New field
        type: String,
        required: true
    },
    phone: { // New field
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Furniture', 'Books', 'Clothing', 'Other'] // Predefined categories
    },
    price: { // New field
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        geolocation: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }
    },
    images: [ImageSchema], // Embedded images
    posted_at: {
        type: Date,
        default: Date.now // Automatically set the current date and time
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'archived'],
        default: 'available'
    }
}, {
    timestamps: true
});

// Create virtual properties for image URLs
ItemSchema.virtual('imageUrls').get(function () {
    return this.images.map((img, index) => `/api/items/${this.item_id}/images/${index}`);
});

ItemSchema.set('toJSON', { virtuals: true });
ItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ItemListing', ItemSchema, 'item_listings');