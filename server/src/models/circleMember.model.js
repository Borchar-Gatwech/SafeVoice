const mongoose = require('mongoose');

const CircleMemberSchema = new mongoose.Schema({
    circleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Circle', 
        required: true 
    },
    anonymousId: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    displayName: { 
        type: String, 
        required: true,
        default: function() {
            // Generate anonymous name if not provided
            const adjectives = ['Brave', 'Strong', 'Resilient', 'Courageous', 'Hopeful', 'Empowered'];
            const nouns = ['Survivor', 'Warrior', 'Phoenix', 'Spirit', 'Voice', 'Heart'];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            return `${adj} ${noun}`;
        }
    },
    reportId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Report' 
    },
    joinedAt: { 
        type: Date, 
        default: Date.now 
    },
    lastActive: { 
        type: Date, 
        default: Date.now 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    messageCount: { 
        type: Number, 
        default: 0 
    },
    helpfulnessScore: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5
    },
    receivedHelpfulnessRatings: { 
        type: Number, 
        default: 0 
    }
});

// Index for efficient queries
CircleMemberSchema.index({ circleId: 1, isActive: 1 });
CircleMemberSchema.index({ anonymousId: 1 });

module.exports = mongoose.model('CircleMember', CircleMemberSchema);

