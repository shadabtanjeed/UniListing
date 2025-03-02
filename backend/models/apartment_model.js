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

const ApartmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    apartment_id: {
        type: String,
        required: true,
        unique: true
    },
    posted_by: {
        type: String,
        required: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        geolocation: {
            latitude: Number,
            longitude: Number
        },
        area: {
            type: String,
            required: true
        },
    },
    bedrooms: {
        total: {
            type: Number,
            required: true
        },
        available: {
            type: Number,
            required: true
        },
        rooms_for_rent: [Number]
    },
    bathrooms: {
        total: {
            type: Number,
            required: true
        },
        common: {
            type: Number,
            required: true
        }
    },
    rent_type: {
        full_apartment: {
            type: Boolean,
            required: true
        },
        partial_rent: {
            enabled: {
                type: Boolean,
                required: true
            },
            rooms_available: {
                type: Number,
                default: 0
            }
        }
    },
    rent: {
        amount: {
            type: Number,
            required: true
        },
        negotiable: {
            type: Boolean,
            default: false
        }
    },
    utility_bill_included: {
        type: Boolean,
        default: false
    },
    amenities: {
        gas: {
            type: Boolean,
            default: false
        },
        lift: {
            type: Boolean,
            default: false
        },
        generator: {
            type: Boolean,
            default: false
        },
        parking: {
            type: Boolean,
            default: false
        },
        security: {
            type: Boolean,
            default: false
        }
    },
    // Changed from ObjectId references to embedded images
    images: [ImageSchema],
    contact_info: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    listing_date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'pending', 'archived'],
        default: 'available'
    },
    optional_details: {
        furnished: {
            type: Boolean,
            default: false
        },
        size: {
            type: Number,
        },
        balcony: {
            type: Boolean,
            default: false
        },
        more_details: {
            type: String
        }
    },
    tenancy_preferences: {
        preferred_tenants: {
            type: Number,
        },
        preferred_dept: [String],
        preferred_semester: [String]
    },
    current_tenants: {
        total: {
            type: Number,
            default: 0
        },
        details: [{
            department: String,
            semester: String
        }]
    },
    upvotes: {
        count: {
            type: Number,
            default: 0
        },
        users: [String]
    }
}, {
    timestamps: true
});

// Create virtual properties for image URLs
ApartmentSchema.virtual('imageUrls').get(function () {
    return this.images.map((img, index) => `/api/apartments/${this.apartment_id}/images/${index}`);
});

ApartmentSchema.set('toJSON', { virtuals: true });
ApartmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ApartmentListing', ApartmentSchema, 'apt_listings');