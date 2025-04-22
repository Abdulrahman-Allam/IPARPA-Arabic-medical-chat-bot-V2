/**
 * SMS Service with graceful fallback when Twilio is not available
 */

require('dotenv').config();
const twilio = require('twilio');

// Get Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Debug environment variables
console.log('SMS Service Environment Variables:');
console.log(`TWILIO_ACCOUNT_SID set: ${!!TWILIO_ACCOUNT_SID}`);
console.log(`TWILIO_AUTH_TOKEN set: ${!!TWILIO_AUTH_TOKEN}`);
console.log(`TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER || 'Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

// Configure whether to simulate SMS or actually send them
const SIMULATE_SMS = process.env.SIMULATE_SMS === 'true' || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN;

console.log(`SMS Simulation Mode: ${SIMULATE_SMS ? 'Enabled' : 'Disabled'}`);

// Initialize Twilio client if credentials are available
let twilioClient;
try {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized successfully');
  } else {
    console.warn('Twilio credentials not found. SMS service will use fallback simulation mode.');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

/**
 * Format a phone number to international format for Twilio
 * Handles various phone number formats and ensures proper Egyptian format with +20 country code
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Egyptian numbers
  if (cleaned.startsWith('0')) {
    // Remove leading zero and add Egypt country code
    cleaned = cleaned.substring(1);
    return `+20${cleaned}`;
  }
  
  // If it already has the country code without plus
  if (cleaned.startsWith('20')) {
    return `+${cleaned}`;
  }
  
  // If the number doesn't match Egyptian format, add the plus prefix if not present
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return phoneNumber; // Return as is if it already has proper format
};

/**
 * Format phone number specifically for Egyptian numbers
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number with Egyptian country code
 */
const formatEgyptianPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Egyptian numbers
  if (cleaned.startsWith('0')) {
    // Remove leading zero and add Egypt country code
    cleaned = cleaned.substring(1);
    return `+20${cleaned}`;
  }
  
  // If it already has the country code without plus
  if (cleaned.startsWith('20')) {
    return `+${cleaned}`;
  }
  
  // If the number is just the local part without country code or leading zero
  if (cleaned.length === 10 && !cleaned.startsWith('0') && !cleaned.startsWith('20')) {
    return `+20${cleaned}`;
  }
  
  // If it's already in international format with plus
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // For any other case, assume it's an Egyptian number and add the country code
  return `+20${cleaned}`;
};

/**
 * Check if we're in development or test environment
 * @returns {boolean} - True if in development/test
 */
const isDevelopmentOrTest = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' || env === 'test';
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Obscure phone number for logging (hide middle digits)
 * @param {string} phoneNumber - The phone number to obscure
 * @returns {string} - Obscured phone number
 */
const obscurePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.length < 8) return phoneNumber;
  
  const start = phoneNumber.substring(0, phoneNumber.length - 6);
  const end = phoneNumber.substring(phoneNumber.length - 2);
  return `${start}XXXX${end}`;
};

/**
 * Send SMS with Twilio
 * @param {string} to - Recipient phone number
 * @param {string} body - SMS message body
 * @returns {Promise<object>} - Response object
 */
const sendSMS = async (to, body) => {
  // Format phone number to international format
  const formattedNumber = formatPhoneNumber(to);
  const originalNumber = to;
  
  // Truncate message if too long (Twilio trial has 160 char limit)
  const truncatedBody = truncateText(body, 140); // Leave room for Unicode chars
  
  console.log(`Sending SMS to ${formattedNumber} (original: ${originalNumber})`);
  
  try {
    // Check if Twilio is properly configured and we're not in simulation mode
    if (twilioClient && !SIMULATE_SMS && TWILIO_PHONE_NUMBER) {
      console.log(`Attempting to send real SMS via Twilio from ${TWILIO_PHONE_NUMBER} to ${formattedNumber}`);
      
      // Send real SMS through Twilio
      const message = await twilioClient.messages.create({
        body: truncatedBody,
        from: TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
      
      console.log(`SMS sent successfully. SID: ${message.sid}, Status: ${message.status}`);
      return {
        success: true,
        sid: message.sid,
        status: message.status
      };
    } else {
      // Fallback simulation mode
      console.log(`[FALLBACK SIMULATED SMS to ${formattedNumber}]:`);
      console.log('----------------------------------------');
      console.log(truncatedBody);
      console.log('----------------------------------------');
      
      console.log(`Confirmation SMS sent to ${formattedNumber}`);
      
      // Debug why we're in simulation mode
      if (!twilioClient) console.log('Reason: Twilio client not initialized');
      if (SIMULATE_SMS) console.log('Reason: SIMULATE_SMS is enabled');
      if (!TWILIO_PHONE_NUMBER) console.log('Reason: TWILIO_PHONE_NUMBER not set');
      
      return {
        success: true,
        simulated: true,
        to: formattedNumber,
        body: truncatedBody
      };
    }
  } catch (error) {
    // Log detailed error for debugging
    console.error(`Error sending SMS: ${error.message || error}`);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}, More Info: ${error.moreInfo || 'N/A'}`);
    }
    
    // For development, provide more detailed debug info and simulate anyway
    if (isDevelopmentOrTest()) {
      console.log(`[FALLBACK SIMULATED SMS to ${formattedNumber}]:`);
      console.log('----------------------------------------');
      console.log(truncatedBody);
      console.log('----------------------------------------');
      
      return {
        success: true,
        simulated: true,
        error: true,
        errorMessage: error.message,
        to: formattedNumber,
        body: truncatedBody
      };
    }
    
    return {
      success: false,
      error: true,
      errorMessage: error.message
    };
  }
};

/**
 * Send appointment confirmation SMS
 * @param {object} data - Appointment data
 * @returns {Promise<object>} - Response object
 */
const sendAppointmentConfirmation = async (data) => {
  const { phone, name, doctorName, specialty, appointmentDate, appointmentTime, location } = data;
  
  // Format date - shortened for brevity
  let dateStr = '';
  try {
    const date = new Date(appointmentDate);
    // Use shorter date format without year
    dateStr = date.toLocaleDateString('ar-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch (e) {
    dateStr = appointmentDate;
  }
  
  // Create a much shorter message to stay within trial limits
  const message = `مرحباً ${name}،
تم تأكيد موعدك: ${specialty}
د. ${doctorName}
${dateStr} ${appointmentTime}
${location}
IPARPA`;
  
  return sendSMS(phone, message);
};

/**
 * Send booking request SMS
 * @param {object} data - Booking data
 * @returns {Promise<object>} - Response object
 */
const sendBookingRequest = async (data) => {
  const { phone, name, specialty, age, notes } = data;
  
  // Create a shorter message format for booking requests
  const message = `طلب حجز:
${name} (${age || '-'})
${specialty}
${notes ? truncateText(notes, 40) : ''}
سنتواصل معك قريباً
IPARPA`;
  
  return sendSMS(phone, message);
};

/**
 * Send appointment cancellation SMS
 * @param {object} data - Cancellation data
 * @returns {Promise<object>} - Response object
 */
const sendCancellationNotification = async (data) => {
  const { phone, name, appointmentId, appointmentDate } = data;
  
  let dateStr = '';
  try {
    const date = new Date(appointmentDate);
    dateStr = date.toLocaleDateString('ar-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch (e) {
    dateStr = appointmentDate;
  }
  
  const message = `مرحباً ${name}،
تم إلغاء موعدك:
${dateStr}
IPARPA`;
  
  return sendSMS(phone, message);
};

/**
 * Send appointment reminder SMS
 * @param {object} data - Reminder data
 * @returns {Promise<object>} - Response object
 */
const sendAppointmentReminder = async (data) => {
  const { phone, name, doctorName, specialty, appointmentDate, appointmentTime, location } = data;
  
  let dateStr = '';
  try {
    const date = new Date(appointmentDate);
    dateStr = date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    dateStr = appointmentDate;
  }
  
  const message = `تذكير: موعدك غداً
مرحباً ${name}،
نود تذكيرك بموعدك غداً:
التخصص: ${specialty}
الطبيب: د. ${doctorName}
التاريخ: ${dateStr}
الوقت: ${appointmentTime}
المكان: ${location}

IPARPA - المساعد الطبي`;
  
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendAppointmentConfirmation,
  sendBookingRequest,
  sendCancellationNotification,
  sendAppointmentReminder,
  formatPhoneNumber,
  formatEgyptianPhoneNumber
};
