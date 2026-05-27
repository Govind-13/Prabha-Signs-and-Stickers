const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────────────────────
// FIX: Fail fast at startup if JWT_SECRET is weak or missing.
// Generate a strong secret with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error(
    'FATAL: JWT_SECRET is too short (minimum 32 characters). ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
  process.exit(1);
}

const protect = (req, res, next) => {
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
  } catch (error) {
    // Don't leak error details to the client
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect, JWT_SECRET };
