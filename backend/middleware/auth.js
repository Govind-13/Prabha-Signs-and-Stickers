const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// Warn loudly at startup if JWT_SECRET is weak/missing,
// but don't crash the server (so the site keeps running while
// env vars are being configured in Render).
// ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set. Admin login will fail.');
} else if (JWT_SECRET.length < 32) {
  console.error('WARNING: JWT_SECRET is too short (min 32 chars). Use a stronger secret.');
}

const protect = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect, JWT_SECRET };
