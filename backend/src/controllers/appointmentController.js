const { Appointment, Schedule, User } = require('../models/index');
const { sendSMS, sendAppointmentConfirmation, sendCancellationNotification } = require('../services/smsService');
const { sendAppointmentConfirmationEmail, sendAppointmentCancellationEmail } = require('../services/emailService');

// Book a new appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { 
            name, age, phone, email,
            doctorName, specialty, appointmentDate, startTime, endTime, location,
            scheduleId, notes
        } = req.body;
        
        // Validate required patient fields
        if (!name || !age || !phone) {
            return res.status(400).json({
                success: false,
                message: "Patient name, age and phone are required"
            });
        }
        
        // Validate required schedule fields if scheduleId is not provided
        if (!scheduleId && (!doctorName || !specialty || !appointmentDate || !startTime || !endTime || !location)) {
            return res.status(400).json({
                success: false,
                message: "Doctor and appointment details are required"
            });
        }
        
        // Create new appointment data object
        const appointmentData = {
            patient: {
                name,
                age,
                phone,
                email
            },
            schedule: {
                doctorName,
                specialty,
                appointmentDate,
                startTime,
                endTime,
                location
            },
            // Set default status to pending
            status: 'pending',
            notes
        };
        
        // If user is authenticated, add user reference to the appointment
        if (req.user && req.user.userId) {
            appointmentData.patient.userId = req.user.userId;
            
            // Add user email if not provided
            if (!email) {
                const user = await User.findById(req.user.userId);
                if (user) {
                    appointmentData.patient.email = user.email;
                }
            }
        }
        
        // If scheduleId is provided, fetch and use the schedule details
        if (scheduleId) {
            const schedule = await Schedule.findById(scheduleId);
            
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: "Schedule not found"
                });
            }
            
            if (!schedule.available) {
                return res.status(400).json({
                    success: false,
                    message: "This schedule is no longer available"
                });
            }
            
            // Update appointment with schedule details
            appointmentData.schedule = {
                doctorName: schedule.doctorName,
                specialty: schedule.specialty,
                appointmentDate: schedule.appointmentDate,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                location: schedule.location,
                scheduleId: schedule._id
            };
            
            // Set status to "confirmed" (محجوز) for appointments with available schedules
            appointmentData.status = 'confirmed';
            
            // Mark the schedule as unavailable
            schedule.available = false;
            await schedule.save();
        }
        
        // Create and save the appointment
        const appointment = new Appointment(appointmentData);
        await appointment.save();
        
        // Send notifications to patient
        try {
            const notificationPromises = [];
            
            // Prepare SMS notification
            const smsData = {
                phone: appointment.patient.phone,
                name: appointment.patient.name,
                doctorName: appointment.schedule.doctorName,
                specialty: appointment.schedule.specialty,
                appointmentDate: appointment.schedule.appointmentDate,
                appointmentTime: appointment.schedule.startTime,
                location: appointment.schedule.location
            };
            
            // Add SMS notification to promises
            notificationPromises.push(sendAppointmentConfirmation(smsData));
            
            // Add email notification if email is provided
            if (appointment.patient.email) {
                notificationPromises.push(sendAppointmentConfirmationEmail(appointment));
            }
            
            // Execute all notification promises in parallel
            await Promise.all(notificationPromises);
            
            console.log(`Notifications sent to ${appointment.patient.phone}${appointment.patient.email ? ' and ' + appointment.patient.email : ''}`);
        } catch (notificationError) {
            console.error('Failed to send notifications:', notificationError);
            // Don't let notification failures affect the API response
        }
        
        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: "Error booking appointment",
            error: error.message
        });
    }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .sort('-createdAt')
            .populate('patient.userId', 'name email')
            .populate('schedule.scheduleId');
        
        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message
        });
    }
};

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
    try {
        if (!req.user || (!req.user.userId && !req.user.email)) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        // Build a query to find appointments by either userId or email
        const query = {
            $or: []
        };
        
        // Add userId condition if it exists
        if (req.user.userId) {
            query.$or.push({ 'patient.userId': req.user.userId });
            query.$or.push({ userId: req.user.userId });
        }
        
        // Add email condition if it exists
        if (req.user.email) {
            query.$or.push({ 'patient.email': req.user.email });
            query.$or.push({ email: req.user.email });
        }
        
        console.log('Finding appointments with query:', JSON.stringify(query));
        
        const appointments = await Appointment.find(query)
            .sort('-schedule.appointmentDate')
            .lean();
        
        console.log(`Found ${appointments.length} appointments for user`);
        
        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('Error in getUserAppointments:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user appointments",
            error: error.message
        });
    }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        
        // Store appointment data for notifications before deletion
        const appointmentData = { ...appointment.toObject() };
        
        // If appointment was booked from a schedule, make that schedule available again
        if (appointment.schedule && appointment.schedule.scheduleId) {
            const schedule = await Schedule.findById(appointment.schedule.scheduleId);
            if (schedule) {
                schedule.available = true;
                await schedule.save();
            }
        }
        
        await appointment.deleteOne(); // Using deleteOne instead of remove which is deprecated
        
        // Send cancellation notifications
        try {
            // Send SMS notification
            const smsData = {
                phone: appointmentData.patient.phone,
                name: appointmentData.patient.name,
                appointmentId: appointmentData._id,
                appointmentDate: appointmentData.schedule.appointmentDate
            };
            
            await sendCancellationNotification(smsData);
            console.log(`Cancellation SMS sent to ${appointmentData.patient.phone}`);
            
            // Send email notification if email is provided
            if (appointmentData.patient.email) {
                await sendAppointmentCancellationEmail(appointmentData, false);
                console.log(`Cancellation email sent to ${appointmentData.patient.email}`);
            }
        } catch (notificationError) {
            console.error('Failed to send cancellation notifications:', notificationError);
        }
        
        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting appointment",
            error: error.message
        });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required"
            });
        }
        
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        
        const oldStatus = appointment.status;
        appointment.status = status;
        
        // If cancelling, make the schedule available again
        if (status === 'cancelled' && appointment.schedule.scheduleId) {
            const schedule = await Schedule.findById(appointment.schedule.scheduleId);
            if (schedule) {
                schedule.available = true;
                await schedule.save();
            }
        }
        
        await appointment.save();
        
        // Send notifications when status changes
        const notificationPromises = [];
        
        // If status changed to cancelled, send cancellation notifications
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            try {
                // SMS notification
                const smsData = {
                    phone: appointment.patient.phone,
                    name: appointment.patient.name,
                    appointmentId: appointment._id,
                    appointmentDate: appointment.schedule.appointmentDate
                };
                
                notificationPromises.push(sendCancellationNotification(smsData));
                
                // Email notification if email is provided
                if (appointment.patient.email) {
                    notificationPromises.push(sendAppointmentCancellationEmail(appointment, false));
                }
            } catch (notificationError) {
                console.error('Failed to prepare cancellation notifications:', notificationError);
            }
        }
        
        // If status changed to confirmed, send confirmation notifications
        if (status === 'confirmed' && oldStatus !== 'confirmed') {
            try {
                // SMS notification
                const smsData = {
                    phone: appointment.patient.phone,
                    name: appointment.patient.name,
                    doctorName: appointment.schedule.doctorName,
                    specialty: appointment.schedule.specialty,
                    appointmentDate: appointment.schedule.appointmentDate,
                    appointmentTime: appointment.schedule.startTime,
                    location: appointment.schedule.location
                };
                
                notificationPromises.push(sendAppointmentConfirmation(smsData));
                
                // Email notification if email is provided
                if (appointment.patient.email) {
                    notificationPromises.push(sendAppointmentConfirmationEmail(appointment));
                }
            } catch (notificationError) {
                console.error('Failed to prepare confirmation notifications:', notificationError);
            }
        }
        
        // Execute all notification promises in parallel
        if (notificationPromises.length > 0) {
            Promise.all(notificationPromises)
                .then(() => console.log('All notifications sent'))
                .catch(err => console.error('Error sending some notifications:', err));
        }
        
        res.status(200).json({
            success: true,
            message: "Appointment status updated successfully",
            previousStatus: oldStatus,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating appointment status",
            error: error.message
        });
    }
};

// Assign a pending appointment to an available doctor schedule
exports.assignAppointmentToDoctor = async (req, res) => {
    try {
        const { appointmentId, scheduleId } = req.body;
        
        if (!appointmentId || !scheduleId) {
            return res.status(400).json({
                success: false,
                message: "Both appointmentId and scheduleId are required"
            });
        }
        
        // Find the appointment
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        
        // Verify appointment is in pending status
        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending appointments can be assigned to doctors"
            });
        }
        
        // Find the schedule
        const schedule = await Schedule.findById(scheduleId);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found"
            });
        }
        
        // Verify schedule is available
        if (!schedule.available) {
            return res.status(400).json({
                success: false,
                message: "This schedule is no longer available"
            });
        }
        
        // Verify specialty matching
        if (schedule.specialty !== appointment.schedule.specialty) {
            return res.status(400).json({
                success: false,
                message: "Specialty mismatch between appointment and doctor schedule"
            });
        }
        
        // Update the appointment with schedule details
        appointment.schedule.doctorName = schedule.doctorName;
        appointment.schedule.appointmentDate = schedule.appointmentDate;
        appointment.schedule.startTime = schedule.startTime;
        appointment.schedule.endTime = schedule.endTime;
        appointment.schedule.location = schedule.location;
        appointment.schedule.scheduleId = schedule._id;
        
        // Update status to confirmed
        appointment.status = 'confirmed';
        
        // Save the appointment
        await appointment.save();
        
        // Mark the schedule as unavailable
        schedule.available = false;
        await schedule.save();
        
        // Send notifications for the newly assigned appointment
        try {
            const notificationPromises = [];
            
            // Format date for SMS
            const formattedDate = new Date(appointment.schedule.appointmentDate).toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Prepare and send SMS notification
            const confirmationMessage = `مرحباً ${appointment.patient.name}،
تم تأكيد موعدك:
✓ موعد مؤكد
التخصص: ${appointment.schedule.specialty}
الطبيب: د. ${appointment.schedule.doctorName}
التاريخ: ${formattedDate}
الوقت: ${appointment.schedule.startTime}
المكان: ${appointment.schedule.location}

نتطلع لرؤيتك في الموعد المحدد
IPARPA - المساعد الطبي`;
            
            notificationPromises.push(sendSMS(appointment.patient.phone, confirmationMessage));
            
            // Send email notification if email is provided
            if (appointment.patient.email) {
                notificationPromises.push(sendAppointmentConfirmationEmail(appointment));
            }
            
            // Execute all notification promises in parallel
            await Promise.all(notificationPromises);
            
            console.log(`Assignment notifications sent to ${appointment.patient.phone}${appointment.patient.email ? ' and ' + appointment.patient.email : ''}`);
        } catch (notificationError) {
            console.error('Failed to send assignment notifications:', notificationError);
            // Don't let notification failures affect the API response
        }
        
        res.status(200).json({
            success: true,
            message: "Appointment successfully assigned to doctor",
            appointment
        });
        
    } catch (error) {
        console.error('Error assigning appointment to doctor:', error);
        res.status(500).json({
            success: false,
            message: "Error assigning appointment to doctor",
            error: error.message
        });
    }
};

// Get available schedules for specific specialty (for assignment)
exports.getAvailableSchedulesForAssignment = async (req, res) => {
    try {
        const { specialty } = req.params;
        
        if (!specialty) {
            return res.status(400).json({
                success: false,
                message: "Specialty is required"
            });
        }
        
        // Find available schedules for the given specialty
        const schedules = await Schedule.find({
            specialty: specialty,
            available: true,
            appointmentDate: { $gte: new Date() }
        }).sort('appointmentDate');
        
        res.status(200).json({
            success: true,
            count: schedules.length,
            schedules
        });
        
    } catch (error) {
        console.error('Error fetching available schedules for assignment:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching available schedules",
            error: error.message
        });
    }
};

// Cancel user's own appointment
exports.cancelUserAppointment = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        
        // Check if the appointment belongs to the user
        if (appointment.patient.userId && 
            appointment.patient.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this appointment"
            });
        }
        
        // Store original status before cancelling
        const oldStatus = appointment.status;
        
        // If the appointment has a schedule ID, make it available again
        if (appointment.schedule && appointment.schedule.scheduleId) {
            const schedule = await Schedule.findById(appointment.schedule.scheduleId);
            if (schedule) {
                schedule.available = true;
                await schedule.save();
            }
        }
        
        // Change status to cancelled
        appointment.status = 'cancelled';
        await appointment.save();
        
        // Send cancellation notifications
        if (oldStatus !== 'cancelled') {
            try {
                // SMS notification
                const smsData = {
                    phone: appointment.patient.phone,
                    name: appointment.patient.name,
                    appointmentId: appointment._id,
                    appointmentDate: appointment.schedule.appointmentDate
                };
                
                await sendCancellationNotification(smsData);
                console.log(`Cancellation SMS sent to ${appointment.patient.phone}`);
                
                // Email notification if email is provided
                if (appointment.patient.email) {
                    await sendAppointmentCancellationEmail(appointment, true);
                    console.log(`Cancellation email sent to ${appointment.patient.email}`);
                }
            } catch (notificationError) {
                console.error('Failed to send cancellation notifications:', notificationError);
                // Don't let notification failures affect the API response
            }
        }
        
        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
            appointment
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            success: false,
            message: "Error cancelling appointment",
            error: error.message
        });
    }
};
