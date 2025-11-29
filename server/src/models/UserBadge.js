const mongoose = require('mongoose');

const UserBadgeSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0 // for progressive badges
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent duplicate badges per user
UserBadgeSchema.index({ anonymousId: 1, badgeId: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', UserBadgeSchema);

