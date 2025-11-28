const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['hotline', 'ngo', 'legal_aid', 'shelter', 'counseling', 'police', 'hospital']
    },
    description: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    address: { type: String },
    location: {
        country: { type: String, required: true },
        region: { type: String }, // State/County
        city: { type: String },
        coordinates: {
        lat: Number,
        lng: Number
        }
    },
    languages: [String],
    hours: { type: String }, // e.g., "24/7" or "Mon-Fri 9AM-5PM"
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    services: [String], // Specific services offered
    isFree: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Geospatial index for location-based queries
ResourceSchema.index({ 'location.coordinates': '2dsphere' });
ResourceSchema.index({ 'location.country': 1, type: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);