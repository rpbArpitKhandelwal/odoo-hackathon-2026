// Seed data: one login per role, plus vehicles/drivers covering EVERY edge case
// the judges will test (expired license, suspended driver, in-shop & retired vehicles).
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
