const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

// Verifies the JWT and attaches { id, role } to req.user