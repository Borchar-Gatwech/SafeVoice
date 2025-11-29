const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String },
  description: { type: String, required: true },
  location: { type: String },
  date: { type: Date, default: Date.now },
  contactMethod: { type: String },
  anonymous: { type: Boolean, default: true },
  reviewed: { type: Boolean, default: false },
  evidenceImages: [{
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    size: { type: Number },
    originalSize: { type: Number }
  }],
  anonymousId: { 
    type: String, 
    index: true // Index for faster badge queries
  }
});

module.exports = mongoose.model('Report', ReportSchema);