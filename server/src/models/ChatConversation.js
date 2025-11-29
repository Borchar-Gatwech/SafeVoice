const mongoose = require('mongoose');

const ChatConversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  anonymousId: {
    type: String,
    required: false, // Optional - user may not have anonymousId
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    language: {
      type: String,
      default: 'en'
    }
  }],
  crisisDetected: {
    type: Boolean,
    default: false
  },
  crisisTimestamp: {
    type: Date
  },
  resourcesProvided: [{
    type: String
  }],
  peerCircleSuggested: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep only last 10 messages
ChatConversationSchema.methods.addMessage = function(role, content, language = 'en') {
  this.messages.push({ role, content, timestamp: new Date(), language });
  
  // Keep only last 10 messages
  if (this.messages.length > 10) {
    this.messages = this.messages.slice(-10);
  }
  
  this.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);

