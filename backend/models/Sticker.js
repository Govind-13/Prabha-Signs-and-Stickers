const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    // Optional, useful for deleting images from Cloudinary later
  },
  category: {
    type: String,
    default: 'General',
  }
}, { timestamps: true });

module.exports = mongoose.model('Sticker', stickerSchema);
