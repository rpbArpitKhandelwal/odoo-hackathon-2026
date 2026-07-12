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

  const driver = await tx.driver.findUnique({ where: { id: Number(driverId) } });
  if (!driver) throw new ApiError(404, 'Driver not found');

  // Rule: suspended drivers cannot be assigned
  if (driver.status === 'SUSPENDED') throw new ApiError(400, `${driver.name} is suspended and cannot drive`);
  if (driver.status === 'OFF_DUTY') throw new ApiError(400, `${driver.name} is off duty`);
  // Rule: a driver already On Trip cannot take another trip
  if (driver.status === 'ON_TRIP') throw new ApiError(409, `${driver.name} is already on a trip`);
  // Rule: expired license blocks assignment
  if (driver.licenseExpiry < new Date()) {
    throw new ApiError(400, `${driver.name}'s license expired on ${driver.licenseExpiry.toISOString().slice(0, 10)}`);
  }
