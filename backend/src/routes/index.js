const express = require('express');
const router = express.Router();
const { getItems, createItem } = require('../controllers/index');
const chatRoutes = require('./chatRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const locationRoutes = require('./locationRoutes');
const authRoutes = require('./authRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const adminRoutes = require('./adminRoutes');

// Original routes
router.get('/items', getItems);
router.post('/items', createItem);

// Add new routes
router.use('/chat', chatRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/locations', locationRoutes);
router.use('/auth', authRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/admin', adminRoutes);

module.exports = router;