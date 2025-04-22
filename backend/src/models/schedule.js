const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true,
        trim: true
    },
    specialty: {
        type: String,
        required: true,
        trim: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        trim: true
    },
    endTime: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    available: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
