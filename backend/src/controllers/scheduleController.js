const { Schedule } = require('../models/index');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().sort('-appointmentDate');
        
        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching schedules",
            error: error.message
        });
    }
};

// Get a single schedule by ID
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }
        
        res.status(200).json({
            success: true,
            schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching schedule",
            error: error.message
        });
    }
};

// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        const { doctorName, specialty, appointmentDate, startTime, endTime, location, notes } = req.body;
        
        // Validate required fields
        if (!doctorName || !specialty || !appointmentDate || !startTime || !endTime || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }
        
        // Create new schedule
        const schedule = new Schedule({
            doctorName,
            specialty,
            appointmentDate,
            startTime,
            endTime,
            location,
            notes
        });
        
        await schedule.save();
        
        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating schedule",
            error: error.message
        });
    }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { doctorName, specialty, appointmentDate, startTime, endTime, location, available, notes } = req.body;
        
        const schedule = await Schedule.findById(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }
        
        // Update fields
        if (doctorName) schedule.doctorName = doctorName;
        if (specialty) schedule.specialty = specialty;
        if (appointmentDate) schedule.appointmentDate = appointmentDate;
        if (startTime) schedule.startTime = startTime;
        if (endTime) schedule.endTime = endTime;
        if (location) schedule.location = location;
        if (available !== undefined) schedule.available = available;
        if (notes !== undefined) schedule.notes = notes;
        
        await schedule.save();
        
        res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating schedule",
            error: error.message
        });
    }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }
        
        await schedule.remove();
        
        res.status(200).json({
            success: true,
            message: "Schedule deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting schedule",
            error: error.message
        });
    }
};

// Get available schedules for a specific specialty
exports.getAvailableSchedulesBySpecialty = async (req, res) => {
    try {
        const { specialty } = req.params;
        
        console.log(`Searching for available schedules with specialty: ${specialty}`);
        
        // Create a case-insensitive regex pattern for the specialty
        const specialtyRegex = new RegExp(specialty, 'i');
        
        const schedules = await Schedule.find({
            specialty: specialtyRegex, // Use regex instead of exact match
            available: true,
            appointmentDate: { $gte: new Date() }
        }).sort('appointmentDate');
        
        console.log(`Found ${schedules.length} matching schedules`);
        
        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });
    } catch (error) {
        console.error('Error fetching schedules by specialty:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching schedules by specialty",
            error: error.message
        });
    }
};
