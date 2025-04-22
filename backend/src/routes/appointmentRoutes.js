const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Book an appointment - can be public or authenticated
router.post('/', appointmentController.bookAppointment);

// Get user's appointments - authenticated users only
router.get('/my-appointments', authenticateToken, appointmentController.getUserAppointments);

// Cancel user's appointment - authenticated users only
router.post('/:id/cancel', authenticateToken, appointmentController.cancelUserAppointment);

// Admin routes - requires authentication and admin role
router.get('/', authenticateToken, isAdmin, appointmentController.getAppointments);
router.delete('/:id', authenticateToken, isAdmin, appointmentController.deleteAppointment);
router.put('/:id/status', authenticateToken, isAdmin, appointmentController.updateAppointmentStatus);
router.post('/assign', authenticateToken, isAdmin, appointmentController.assignAppointmentToDoctor);
router.get('/available-schedules/:specialty', authenticateToken, isAdmin, appointmentController.getAvailableSchedulesForAssignment);

module.exports = router;
