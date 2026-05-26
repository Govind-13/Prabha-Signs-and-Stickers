const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Bootstrap-only: registration is allowed ONLY while zero admins exist.
// Once any admin is in the DB this endpoint is locked, so the public
// internet cannot create new admin accounts.
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const anyAdmin = await Admin.findOne();
    if (anyAdmin) {
      return res.status(403).json({ message: 'Registration disabled. An admin already exists.' });
    }
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
    }
    const admin = await Admin.create({ username, password });
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
