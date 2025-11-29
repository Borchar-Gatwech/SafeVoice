const mongoose = require('mongoose');

const TrustScoreSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  trustLevel: {
    type: String,
    enum: ['newcomer', 'trusted', 'veteran'],
    default: 'newcomer'
  },
  helpfulnessScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  reportCount: {
    type: Number,
    default: 0
  },
  joinedCirclesCount: {
    type: Number,
    default: 0
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  reactionsReceived: {
    type: Number,
    default: 0
  },
  warningsReceived: {
    type: Number,
    default: 0
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: {
    type: Date
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrustScore', TrustScoreSchema);

