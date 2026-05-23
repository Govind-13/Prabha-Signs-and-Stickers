const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Settings = require('../models/Settings');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    // Convert array to object for easier consumption by frontend
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a setting (e.g., animation)
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, async (req, res) => {
  const { key, value } = req.body;

  try {
    let setting = await Settings.findOne({ key });

    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Settings.create({ key, value });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
