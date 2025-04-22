const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Public route - Get available schedules by specialty
router.get('/available/:specialty', scheduleController.getAvailableSchedulesBySpecialty);

// Admin routes - Require authentication and admin role
router.get('/', authenticateToken, isAdmin, scheduleController.getAllSchedules);
router.get('/:id', authenticateToken, isAdmin, scheduleController.getScheduleById);
router.post('/', authenticateToken, isAdmin, scheduleController.createSchedule);
router.put('/:id', authenticateToken, isAdmin, scheduleController.updateSchedule);
router.delete('/:id', authenticateToken, isAdmin, scheduleController.deleteSchedule);

module.exports = router;
