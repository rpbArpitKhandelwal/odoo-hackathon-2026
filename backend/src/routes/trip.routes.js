const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authorize } = require('../middleware/auth');
const tripService = require('../services/trip.service');

// RBAC: Driver owns the trip lifecycle; Fleet Manager has full access to everything
const CAN_MANAGE = ['DRIVER', 'FLEET_MANAGER'];
