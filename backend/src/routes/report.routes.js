const router = require('express').Router();
const prisma = require('../lib/prisma');

// Per-vehicle analytics:
//   distance        = sum of (endOdometer - startOdometer) over completed trips
//   fuelEfficiency  = distance / liters (km per liter)
//   operationalCost = fuel cost + maintenance cost
//   roi             = (revenue - (maintenance + fuel)) / acquisition cost
async function buildVehicleReport() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: { where: { status: 'COMPLETED' } },
      fuelLogs: true,
      maintenanceLogs: true,
      expenses: true,
    },
    orderBy: { regNo: 'asc' },
  });

  return vehicles.map((v) => {