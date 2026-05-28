const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ─────────────────────────────────────────────────────────────
// CORS — restrict to known origins in production.
// Set ALLOWED_ORIGINS in Render as a comma-separated list, e.g.:
//   https://prabha-signs-and-stickers.vercel.app
// Falls back to open CORS if not set (so the site keeps working
// while you configure env vars).
// ─────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions =
  allowedOrigins.length > 0
    ? {
        origin: (origin, callback) => {
          // Allow no-origin requests (curl, Postman, mobile apps)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`CORS: origin "${origin}" not allowed`));
        },
        credentials: true,
      }
    : {}; // open CORS until ALLOWED_ORIGINS is configured

app.use(cors(corsOptions));
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// MongoDB
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

// Render injects PORT — fallback to 5000 for local dev only
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
