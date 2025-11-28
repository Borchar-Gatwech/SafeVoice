const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiKeySchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        index: true
    },
    appDescription: { 
        type: String 
    },
    tier: { 
        type: String, 
        enum: ['free', 'startup', 'enterprise'],
        default: 'free'
    },
    requestLimit: { 
        type: Number, 
        default: 1000 
    },
    requestsThisMonth: { 
        type: Number, 
        default: 0 
    },
    lastUsed: { 
        type: Date 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    features: {
        peerMatching: { type: Boolean, default: true },
        resources: { type: Boolean, default: true },
        reporting: { type: Boolean, default: true },
        analytics: { type: Boolean, default: false }
    }
});

// Static method to generate API key
ApiKeySchema.statics.generateKey = function() {
    return 'sk_' + crypto.randomBytes(32).toString('hex');
};

// Method to check if API key can make request
ApiKeySchema.methods.canMakeRequest = function() {
    if (!this.isActive) return false;
    if (this.tier === 'enterprise') return true;
    return this.requestsThisMonth < this.requestLimit;
};

// Method to increment request count
ApiKeySchema.methods.incrementRequest = async function() {
    this.requestsThisMonth += 1;
    this.lastUsed = new Date();
    await this.save();
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);

