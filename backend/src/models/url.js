const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  referrer: {
    type: String,
    default: 'direct',
  },
  location: {
    type: String,
    default: 'unknown',
  },
  ip: {
    type: String,
    default: '',
  },
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Auto-expire documents when expiresAt is reached
  },
  clicks: [clickSchema],
  clickCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Url', urlSchema);
