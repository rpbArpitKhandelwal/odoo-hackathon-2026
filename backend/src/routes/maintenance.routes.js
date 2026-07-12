const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/maintenance?status=OPEN|CLOSED
router.get('/', async (req, res, next) => {
  try {
    const where = req.query.status ? { status: req.query.status } : {};
    const logs = await prisma.maintenanceLog.findMany({
      where,
      include: { vehicle: true },
      orderBy: { openedAt: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});
