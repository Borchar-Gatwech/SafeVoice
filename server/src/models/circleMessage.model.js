const mongoose = require('mongoose');

const CircleMessageSchema = new mongoose.Schema({
    circleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Circle', 
        required: true,
        index: true
    },
    senderId: { 
        type: String, 
        required: true 
    },
    senderDisplayName: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true,
        maxlength: 2000
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    aiRiskScore: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 10
    },
    flaggedByAI: { 
        type: Boolean, 
        default: false 
    },
    moderated: { 
        type: Boolean, 
        default: false 
    },
    reactions: [{
        emoji: String,
        count: { type: Number, default: 0 },
        users: [String] // anonymousIds
    }],
    edited: { 
        type: Boolean, 
        default: false 
    },
    editedAt: { 
        type: Date 
    }
});

// Index for efficient message retrieval
CircleMessageSchema.index({ circleId: 1, timestamp: -1 });

module.exports = mongoose.model('CircleMessage', CircleMessageSchema);

