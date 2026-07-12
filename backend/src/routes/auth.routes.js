const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { ApiError } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
