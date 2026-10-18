const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET wajib diset di production');
    }
    return 'dev-secret-key-change-in-prod';
  }
  return process.env.JWT_SECRET;
}

module.exports = {
  generateToken: (userId, expiresIn = '7d') => {
    return jwt.sign(
      { userId },
      getJwtSecret(),
      { expiresIn }
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, getJwtSecret());
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  },

  requireAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    try {
      req.user = module.exports.verifyToken(token);
      next();
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
};
