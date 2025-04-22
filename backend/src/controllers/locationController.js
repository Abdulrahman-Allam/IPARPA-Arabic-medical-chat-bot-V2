const { getUserLocation, getNearbyFacilities } = require('../services/locationService');

// Get nearby hospitals
exports.getHospitals = async (req, res) => {
    try {
        let { lat, lng, query } = req.query;
        
        // If coordinates aren't provided, get them from query or default to Cairo
        if (!lat || !lng) {
            const location = await getUserLocation(query || 'Cairo');
            lat = location.lat;
            lng = location.lng;
        }
        
        const hospitals = await getNearbyFacilities(lat, lng, 'hospital');
        
        res.status(200).json({
            success: true,
            userLocation: { lat, lng },
            hospitals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hospitals",
            error: error.message
        });
    }
};

// Get nearby pharmacies
exports.getPharmacies = async (req, res) => {
    try {
        let { lat, lng, query } = req.query;
        
        // If coordinates aren't provided, get them from query or default to Cairo
        if (!lat || !lng) {
            const location = await getUserLocation(query || 'Cairo');
            lat = location.lat;
            lng = location.lng;
        }
        
        const pharmacies = await getNearbyFacilities(lat, lng, 'pharmacy');
        
        res.status(200).json({
            success: true,
            userLocation: { lat, lng },
            pharmacies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching pharmacies",
            error: error.message
        });
    }
};
