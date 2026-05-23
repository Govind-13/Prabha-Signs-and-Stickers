const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Only connect if MONGO_URI is available
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('MONGO_URI is missing. Please set it in your .env file.');
}

// Route Files
const adminRoutes = require('./routes/adminRoutes');
const stickerRoutes = require('./routes/stickerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/stickers', stickerRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.send('Prabha Signs & Stickers API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
