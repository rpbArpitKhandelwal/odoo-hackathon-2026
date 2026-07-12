const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

// Verifies the JWT and attaches { id, role } to req.user
function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}