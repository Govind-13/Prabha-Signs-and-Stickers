const express = require('express');
const router  = express.Router();
const Admin   = require('../models/Admin');
const jwt     = require('jsonwebtoken');

// Use the validated secret from auth middleware (avoids duplication)
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        _id:      admin._id,
        username: admin.username,
        token:    generateToken(admin._id),
      });
    }

    return res.status(401).json({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('POST /admin/login error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Bootstrap: register first admin only (self-locks after one admin exists)
// @route   POST /api/admin/register
// @access  Public (locked after first use)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const anyAdmin = await Admin.findOne();
    if (anyAdmin) {
      return res.status(403).json({
        message: 'Registration disabled. An admin already exists.',
      });
    }

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const admin = await Admin.create({ username, password });
    return res.status(201).json({
      _id:      admin._id,
      username: admin.username,
      token:    generateToken(admin._id),
    });
  } catch (error) {
    console.error('POST /admin/register error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
