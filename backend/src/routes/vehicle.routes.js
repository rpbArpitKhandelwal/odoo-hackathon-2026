const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

function validateVehicle(body) {
  const { regNo, name, type, maxLoadKg, acquisitionCost } = body;
  if (!regNo || !regNo.trim()) throw new ApiError(400, 'Registration number is required');
  if (!name || !name.trim()) throw new ApiError(400, 'Vehicle name is required');
  if (!type || !type.trim()) throw new ApiError(400, 'Vehicle type is required');
  if (!(Number(maxLoadKg) > 0)) throw new ApiError(400, 'Max load capacity must be a positive number');
  if (!(Number(acquisitionCost) >= 0)) throw new ApiError(400, 'Acquisition cost must be a number');
}

// GET /api/vehicles?status=&type=&region=&available=true&search=
// available=true -> ONLY vehicles legal to dispatch (business rule: never Retired / In Shop / On Trip)
router.get('/', async (req, res, next) => {
  try {
    const { status, type, region, available, search } = req.query;
    const where = {};
    if (available === 'true') where.status = 'AVAILABLE';
    else if (status) where.status = status;
    if (type) where.type = type;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { regNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(req.params.id) },
      include: { maintenanceLogs: true, fuelLogs: true, expenses: true },
    });
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});