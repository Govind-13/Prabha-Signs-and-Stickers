const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Sticker = require('../models/Sticker');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// ─────────────────────────────────────────────────────────────
// Configure Cloudinary
// FIX: was CLOUDINARY_NAME — must match backend/.env key exactly
// ─────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // ← fixed
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'prabha_stickers',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ─────────────────────────────────────────────────────────────
// Allowed category values (whitelist)
// ─────────────────────────────────────────────────────────────
const ALLOWED_CATEGORIES = [
  'Car and Bike Stickers',
  'Business Signage',
  'Specialty Items',
  'General',
];

// @desc    Get all stickers
// @route   GET /api/stickers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stickers = await Sticker.find().sort({ createdAt: -1 });
    res.json(stickers);
  } catch (error) {
    console.error('GET /stickers error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a sticker
// @route   POST /api/stickers
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // ── Input validation ──────────────────────────────────────
    const title    = (req.body.title    || '').trim().slice(0, 100) || 'Untitled';
    const category = (req.body.category || '').trim();

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
    }

    const sticker = new Sticker({
      title,
      imageUrl:  req.file.path,
      publicId:  req.file.filename,
      category:  ALLOWED_CATEGORIES.includes(category) ? category : 'General',
    });

    const created = await sticker.save();
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /stickers error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a sticker
// @route   DELETE /api/stickers/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.id);

    if (!sticker) {
      return res.status(404).json({ message: 'Sticker not found' });
    }

    if (sticker.publicId) {
      await cloudinary.uploader.destroy(sticker.publicId);
    }
    await sticker.deleteOne();
    res.json({ message: 'Sticker removed' });
  } catch (error) {
    console.error('DELETE /stickers/:id error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
