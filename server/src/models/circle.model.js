const mongoose = require('mongoose');

const CircleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    incidentType: { type: String, required: true }, // e.g., 'online_harassment', 'workplace_discrimination'
    locationRegion: { type: String, required: true }, // e.g., 'kenya', 'nigeria'
    language: { type: String, default: 'english' },
    description: { type: String },
    memberCount: { type: Number, default: 0 },
    maxMembers: { type: Number, default: 5 },
    facilitatorId: { type: String }, // Optional verified facilitator
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    tags: [String], // Additional matching criteria
    averageHelpfulnessScore: { type: Number, default: 0 }
});

// Index for efficient matching queries
CircleSchema.index({ incidentType: 1, locationRegion: 1, isActive: 1 });

module.exports = mongoose.model('Circle', CircleSchema);