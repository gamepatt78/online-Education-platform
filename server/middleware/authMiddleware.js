const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwtSecret');
const { Users } = require('../services/storageService');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  let verified;
  try {
    verified = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }

  try {
    const user = await Users.findByEmail(verified.email);
    if (!user || Number(user.id) !== Number(verified.id) || user.is_active === false ||
        String(user.role).toLowerCase() !== String(verified.role).toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Account is unavailable or its access has changed.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: String(user.role).toLowerCase(),
      name: user.name
    };
    return next();
  } catch (error) {
    console.error('Token account validation failed.');
    return res.status(500).json({ success: false, message: 'Unable to verify the account.' });
  }
};

exports.requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access forbidden: Role undefined.' });
    }
    const userRole = (req.user.role || '').toLowerCase();
    const authorized = allowedRoles.map(r => r.toLowerCase()).includes(userRole);
    if (!authorized) {
      return res.status(403).json({ success: false, message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]` });
    }
    next();
  };
};
