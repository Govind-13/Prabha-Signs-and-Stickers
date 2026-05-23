const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // e.g., 'headerAnimation'
  },
  value: {
    type: String,
    required: true, // e.g., 'fade', 'bounce'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
