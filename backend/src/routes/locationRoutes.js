const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Routes for location services
router.get('/hospitals', locationController.getHospitals);
router.get('/pharmacies', locationController.getPharmacies);

module.exports = router;
