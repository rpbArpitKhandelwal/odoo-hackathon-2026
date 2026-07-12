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