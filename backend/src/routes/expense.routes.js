const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');

// RBAC: Financial Analyst owns expenses; Fleet Manager has full access; Driver has no access
const CAN_WRITE = ['FINANCIAL_ANALYST', 'FLEET_MANAGER'];
const CAN_READ = ['FINANCIAL_ANALYST', 'FLEET_MANAGER', 'SAFETY_OFFICER'];
const CATEGORIES = ['TOLL', 'PARKING', 'FINE', 'MISC'];

// GET /api/expenses?vehicleId=&category=
router.get('/', authorize(...CAN_READ), async (req, res, next) => {
  try {
    const where = {};
    if (req.query.vehicleId) where.vehicleId = Number(req.query.vehicleId);
    if (req.query.category) where.category = req.query.category;
    const expenses = await prisma.expense.findMany({
      where,
      include: { vehicle: true, trip: true },
      orderBy: { spentAt: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});