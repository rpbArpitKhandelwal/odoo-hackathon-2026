const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

// RBAC: Financial Analyst owns fuel logs; Fleet Manager has full access; Driver has no access
const CAN_WRITE = ['FINANCIAL_ANALYST', 'FLEET_MANAGER'];
const CAN_READ = ['FINANCIAL_ANALYST', 'FLEET_MANAGER', 'SAFETY_OFFICER'];

// GET /api/fuel-logs?vehicleId=
router.get('/', authorize(...CAN_READ), async (req, res, next) => {
  try {
    const where = req.query.vehicleId ? { vehicleId: Number(req.query.vehicleId) } : {};
    const logs = await prisma.fuelLog.findMany({
      where,
      include: { vehicle: true, trip: true },
      orderBy: { filledAt: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});