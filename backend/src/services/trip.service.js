// Trip lifecycle service — the heart of TransitOps.
// EVERY mandatory business rule from the problem statement is enforced here,
// and every status transition runs inside a single DB transaction so a
// half-applied dispatch/complete/cancel is impossible.
const prisma = require('../lib/prisma');
const { ApiError } = require('../middleware/errorHandler');

// Shared validation used on create AND re-checked at dispatch time.
// (tx = transaction client, so dispatch checks are race-safe.)
async function assertAssignable(tx, { vehicleId, driverId, cargoWeightKg }) {
  const vehicle = await tx.vehicle.findUnique({ where: { id: Number(vehicleId) } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  // Rule: Retired or In-Shop vehicles must never be dispatched
  if (vehicle.status === 'RETIRED') throw new ApiError(400, `${vehicle.name} is retired and cannot be dispatched`);
  if (vehicle.status === 'IN_SHOP') throw new ApiError(400, `${vehicle.name} is in the shop for maintenance`);
  // Rule: a vehicle already On Trip cannot take another trip
  if (vehicle.status === 'ON_TRIP') throw new ApiError(409, `${vehicle.name} is already on a trip`);
