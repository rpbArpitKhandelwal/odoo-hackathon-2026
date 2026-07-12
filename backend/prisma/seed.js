// Seed data: one login per role, plus vehicles/drivers covering EVERY edge case
// the judges will test (expired license, suspended driver, in-shop & retired vehicles).
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // --- Roles ---
  const roleNames = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
  const roles = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
