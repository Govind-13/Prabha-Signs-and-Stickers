const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Sticker = require('../models/Sticker');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prabha_stickers',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// @desc    Get all stickers
// @route   GET /api/stickers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stickers = await Sticker.find().sort({ createdAt: -1 });
    res.json(stickers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a sticker
// @route   POST /api/stickers
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const sticker = new Sticker({
      title: title || 'Untitled',
      imageUrl: req.file.path,
      publicId: req.file.filename,
      category: category || 'General'
    });

    const createdSticker = await sticker.save();
    res.status(201).json(createdSticker);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a sticker
// @route   DELETE /api/stickers/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.id);

    if (sticker) {
      if (sticker.publicId) {
        await cloudinary.uploader.destroy(sticker.publicId);
      }
      await sticker.deleteOne();
      res.json({ message: 'Sticker removed' });
    } else {
      res.status(404).json({ message: 'Sticker not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
