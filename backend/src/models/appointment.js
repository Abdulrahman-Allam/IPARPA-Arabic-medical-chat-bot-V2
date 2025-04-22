const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new mongoose.Schema({
    // Patient information
    patient: {
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        // Optional reference to user if the patient has an account
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    
    // Doctor/Schedule information
    schedule: {
        doctorName: {
            type: String,
            required: true,
        },
        specialty: {
            type: String,
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        // Reference to the schedule if it was booked from existing schedules
        scheduleId: {
            type: Schema.Types.ObjectId,
            ref: 'Schedule',
        }
    },
    
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending' // Default to pending
    },
    
    notes: {
        type: String,
        trim: true,
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
