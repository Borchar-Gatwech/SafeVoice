const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true // emoji or icon name
  },
  criteria: {
    type: String,
    required: true,
    enum: [
      'join_first_circle',
      'submit_report',
      'send_10_messages',
      'help_5_members',
      'consecutive_7_days',
      'receive_10_reactions',
      'invite_member',
      'growth_milestone'
    ]
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', BadgeSchema);

