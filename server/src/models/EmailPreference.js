const mongoose = require('mongoose');

const EmailPreferenceSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: false // Optional - users may not provide email
  },
  welcomeEmails: {
    type: Boolean,
    default: true
  },
  circleNotifications: {
    type: Boolean,
    default: true
  },
  weeklyDigest: {
    type: Boolean,
    default: false
  },
  badgeNotifications: {
    type: Boolean,
    default: true
  },
  resourceRecommendations: {
    type: Boolean,
    default: true
  },
  unsubscribedAt: {
    type: Date
  },
  unsubscribed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

EmailPreferenceSchema.index({ anonymousId: 1 }, { unique: true });

module.exports = mongoose.model('EmailPreference', EmailPreferenceSchema);

