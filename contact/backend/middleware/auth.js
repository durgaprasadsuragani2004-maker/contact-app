const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_qrlync_2026_digital_profile';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required. Please log in.' });
  }

  // Verify token synchronously
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Look up user in MongoDB (Mongoose)
    User.findById(decoded.id)
      .select('_id email account_type created_at')
      .lean()
      .exec()
      .then(user => {
        if (!user) {
          return res.status(404).json({ success: false, message: 'User account not found.' });
        }
        req.user = { id: user._id, email: user.email, account_type: user.account_type, created_at: user.created_at };
        next();
      })
      .catch(err => {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ success: false, message: 'Server error during authentication.' });
      });
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
