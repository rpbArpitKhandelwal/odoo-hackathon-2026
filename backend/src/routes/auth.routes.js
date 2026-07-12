const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { ApiError } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, role: user.role.name }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
}

// POST /api/auth/register  { name, email, password, role }
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !name.trim()) throw new ApiError(400, 'Name is required');
    if (!EMAIL_RE.test(email || '')) throw new ApiError(400, 'Entered email is invalid');
    if (!password || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
