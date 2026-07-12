// Trip lifecycle service — the heart of TransitOps.
// EVERY mandatory business rule from the problem statement is enforced here,
// and every status transition runs inside a single DB transaction so a
// half-applied dispatch/complete/cancel is impossible.
const prisma = require('../lib/prisma');
const { ApiError } = require('../middleware/errorHandler');
