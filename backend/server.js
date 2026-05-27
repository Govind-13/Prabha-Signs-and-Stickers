const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─────────────────────────────────────────────────────────────
// FIX: Restrict CORS to known origins instead of wildcard.
// Add your Vercel URL (and localhost for dev) here.
// ─────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Always allow localhost during development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ─────────────────────────────────────────────────────────────
// MongoDB connection
// ─────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('MONGO_URI is missing. Database routes will fail.');
}

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
const adminRoutes    = require('./routes/adminRoutes');
const stickerRoutes  = require('./routes/stickerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use('/api/admin',    adminRoutes);
app.use('/api/stickers', stickerRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (_req, res) => {
  res.send('Prabha Signs & Stickers API is running...');
});

// ─────────────────────────────────────────────────────────────
// FIX: Do NOT read PORT from .env in production — Render injects it.
// Fallback to 5000 for local dev only when PORT is not set at all.
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
