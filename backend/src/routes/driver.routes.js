const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

// RBAC: Safety Officer manages drivers; Fleet Manager has full access to everything
const CAN_WRITE = ['SAFETY_OFFICER', 'FLEET_MANAGER'];

function validateDriver(body) {
  const { name, licenseNo, licenseCategory, licenseExpiry, contact } = body;
  if (!name || !name.trim()) throw new ApiError(400, 'Driver name is required');
  if (!licenseNo || !licenseNo.trim()) throw new ApiError(400, 'License number is required');
  if (!licenseCategory || !licenseCategory.trim()) throw new ApiError(400, 'License category is required');
  if (!licenseExpiry || isNaN(Date.parse(licenseExpiry))) throw new ApiError(400, 'A valid license expiry date is required');
  if (!contact || !/^\d{10}$/.test(contact)) throw new ApiError(400, 'Contact must be a 10-digit number');
}

// GET /api/drivers?status=&assignable=true&search=
// assignable=true -> only drivers legal for a trip (Available AND license not expired)
router.get('/', async (req, res, next) => {
  try {
    const { status, assignable, search } = req.query;
    const where = {};
    if (assignable === 'true') {
      where.status = 'AVAILABLE';
      where.licenseExpiry = { gte: new Date() };
    } else if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const drivers = await prisma.driver.findMany({ where, orderBy: { name: 'asc' } });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
});