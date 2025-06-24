/**
 * Email Service using SendGrid
 * Provides email functionality for user registration, appointment confirmations, and notifications
 */

const dotenv = require('dotenv');
const path = require('path');
const sgMail = require('@sendgrid/mail');

// Load environment variables from .env file - specify the path explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set the SendGrid API key from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Debug environment variables
console.log('Email Service Environment Variables:');
console.log(`SENDGRID_API_KEY set: ${!!SENDGRID_API_KEY}`);
console.log(`SENDGRID_API_KEY value: ${SENDGRID_API_KEY}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

// Configure whether to simulate emails or actually send them
const SIMULATE_EMAIL = process.env.SIMULATE_EMAIL === 'true' || !SENDGRID_API_KEY || process.env.NODE_ENV === 'test';

console.log(`Email Simulation Mode: ${SIMULATE_EMAIL ? 'Enabled' : 'Disabled'}`);

// Initialize SendGrid API if credentials are available
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('SendGrid API initialized successfully');
} else {
    console.warn('SendGrid API key not provided, email sending will be simulated');
}

/**
 * Main function to send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of email
 * @param {string} options.html - HTML version of email
 * @param {string} options.from - Sender email (defaults to configured sender)
 * @returns {Promise<Object>} - Response from SendGrid or simulated response
 */
const sendEmail = async ({ to, subject, text, html, from = 'healsync@hotmail.com' }) => {
    // Validate required fields
    if (!to || !subject || (!text && !html)) {
        throw new Error('Email recipient, subject, and content are required');
    }

    const msg = {
        to,
        from,
        subject,
        text: text || 'Please view this email with an HTML-compatible email client',
        html: html || `<p>${text}</p>`
    };

    // Log email details (obscure email addresses in production)
    const isProduction = process.env.NODE_ENV === 'production';
    const obscuredTo = isProduction ? obscureEmail(to) : to;
    
    console.log(`Preparing to send email to: ${obscuredTo}`);
    console.log(`Subject: ${subject}`);

    try {
        // If simulation is enabled, log the email instead of sending it
        if (SIMULATE_EMAIL) {
            console.log('SIMULATED EMAIL:');
            console.log('===============');
            console.log(`To: ${to}`);
            console.log(`From: ${from}`);
            console.log(`Subject: ${subject}`);
            console.log('Text Content:');
            console.log(text);
            console.log('===============');
            
            return {
                simulated: true,
                status: 'success',
                message: 'Email simulated successfully'
            };
        }

        // Send the email through SendGrid
        const response = await sgMail.send(msg);
        console.log(`Email sent successfully to ${obscuredTo}`);
        return {
            simulated: false,
            status: 'success',
            statusCode: response[0].statusCode,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email:', error);
        
        // If there's a SendGrid error response, include it
        if (error.response) {
            console.error('SendGrid error response:', error.response.body);
        }
        
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendWelcomeEmail = async (to, name) => {
    const subject = 'مرحباً بك في IPARPA - المساعد الطبي';
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${name}،</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">شكراً لتسجيلك في IPARPA، المساعد الطبي الذكي!</p>
            
            <p style="font-size: 16px; line-height: 1.6;">مع IPARPA، يمكنك:</p>
            
            <ul style="font-size: 16px; line-height: 1.6;">
                <li>الحصول على استشارات طبية بالعربية</li>
                <li>حجز مواعيد مع الأطباء</li>
                <li>البحث عن المستشفيات والصيدليات القريبة</li>
                <li>متابعة سجلك الطبي وتاريخ المواعيد</li>
            </ul>
            
            <p style="font-size: 16px; line-height: 1.6;">نحن هنا لمساعدتك في رحلتك الصحية.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://iparpa.com/login" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">تسجيل الدخول إلى حسابك</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مع أطيب التحيات،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${name}،
    
    شكراً لتسجيلك في IPARPA، المساعد الطبي الذكي!
    
    مع IPARPA، يمكنك:
    - الحصول على استشارات طبية بالعربية
    - حجز مواعيد مع الأطباء
    - البحث عن المستشفيات والصيدليات القريبة
    - متابعة سجلك الطبي وتاريخ المواعيد
    
    نحن هنا لمساعدتك في رحلتك الصحية.
    
    تسجيل الدخول إلى حسابك: https://iparpa.com/login
    
    مع أطيب التحيات،
    فريق IPARPA
    `;
    
    return await sendEmail({
        to,
        subject,
        text: textContent,
        html: htmlContent
    });
};

/**
 * Send an appointment confirmation email
 * @param {Object} appointmentData - The appointment details
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendAppointmentConfirmationEmail = async (appointmentData) => {
    // Ensure we have necessary data
    if (!appointmentData || !appointmentData.patient || !appointmentData.schedule) {
        throw new Error('Invalid appointment data for email');
    }
    
    const { patient, schedule, status } = appointmentData;
    
    // Skip if no email is provided
    if (!patient.email) {
        console.log('No email address provided for appointment confirmation');
        return { skipped: true, reason: 'No email address' };
    }
    
    // Format the appointment date in Arabic
    const appointmentDate = new Date(schedule.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const subject = status === 'confirmed' 
        ? 'تأكيد موعدك مع IPARPA' 
        : 'تم استلام طلب حجز موعدك - IPARPA';
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${patient.name}،</h2>
            
            ${status === 'confirmed' 
                ? `<p style="font-size: 16px; line-height: 1.6;">تم تأكيد موعدك بنجاح:</p>` 
                : `<p style="font-size: 16px; line-height: 1.6;">تم استلام طلب حجز موعدك:</p>`}
            
            <div style="background-color: ${status === 'confirmed' ? '#e6f7ff' : '#fff8e6'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid ${status === 'confirmed' ? '#0070c0' : '#ffc107'};">
                <p style="margin: 5px 0;"><strong>الحالة:</strong> ${status === 'confirmed' ? '✓ مؤكد' : '⏳ في انتظار التأكيد'}</p>
                <p style="margin: 5px 0;"><strong>التخصص:</strong> ${schedule.specialty}</p>
                ${status === 'confirmed' ? `<p style="margin: 5px 0;"><strong>الطبيب:</strong> د. ${schedule.doctorName}</p>` : ''}
                <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${formattedDate}</p>
                ${status === 'confirmed' ? `<p style="margin: 5px 0;"><strong>الوقت:</strong> ${schedule.startTime}</p>` : ''}
                ${status === 'confirmed' ? `<p style="margin: 5px 0;"><strong>المكان:</strong> ${schedule.location}</p>` : ''}
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">
                ${status === 'confirmed' 
                    ? 'نتطلع لرؤيتك في الموعد المحدد. يرجى الحضور قبل 15 دقيقة من الموعد.'
                    : 'سيتم الاتصال بك قريبًا لتأكيد موعدك.'}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">لإلغاء الموعد أو تغييره، يرجى الاتصال بنا أو زيارة حسابك على موقعنا الإلكتروني.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://iparpa.com/appointments" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">عرض مواعيدي</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مع تمنياتنا لك بالصحة والعافية،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${patient.name}،
    
    ${status === 'confirmed' ? 'تم تأكيد موعدك بنجاح:' : 'تم استلام طلب حجز موعدك:'}
    
    الحالة: ${status === 'confirmed' ? 'مؤكد' : 'في انتظار التأكيد'}
    التخصص: ${schedule.specialty}
    ${status === 'confirmed' ? `الطبيب: د. ${schedule.doctorName}` : ''}
    التاريخ: ${formattedDate}
    ${status === 'confirmed' ? `الوقت: ${schedule.startTime}` : ''}
    ${status === 'confirmed' ? `المكان: ${schedule.location}` : ''}
    
    ${status === 'confirmed' 
        ? 'نتطلع لرؤيتك في الموعد المحدد. يرجى الحضور قبل 15 دقيقة من الموعد.'
        : 'سيتم الاتصال بك قريبًا لتأكيد موعدك.'}
    
    لإلغاء الموعد أو تغييره، يرجى الاتصال بنا أو زيارة حسابك على موقعنا الإلكتروني.
    
    عرض مواعيدي: https://iparpa.com/appointments
    
    مع تمنياتنا لك بالصحة والعافية،
    فريق IPARPA
    `;
    
    return await sendEmail({
        to: patient.email,
        subject,
        text: textContent,
        html: htmlContent
    });
};

/**
 * Send an appointment cancellation email
 * @param {Object} appointmentData - The appointment details
 * @param {boolean} cancelledByUser - Whether the user cancelled the appointment
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendAppointmentCancellationEmail = async (appointmentData, cancelledByUser = false) => {
    // Ensure we have necessary data
    if (!appointmentData || !appointmentData.patient || !appointmentData.schedule) {
        throw new Error('Invalid appointment data for cancellation email');
    }
    
    const { patient, schedule } = appointmentData;
    
    // Skip if no email is provided
    if (!patient.email) {
        console.log('No email address provided for appointment cancellation');
        return { skipped: true, reason: 'No email address' };
    }
    
    // Format the appointment date in Arabic
    const appointmentDate = new Date(schedule.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const subject = 'تم إلغاء موعدك - IPARPA';
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${patient.name}،</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
                ${cancelledByUser 
                    ? 'لقد قمت بإلغاء موعدك التالي:' 
                    : 'نود إعلامك بأنه تم إلغاء موعدك التالي:'}
            </p>
            
            <div style="background-color: #fff0f0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #dc3545;">
                <p style="margin: 5px 0;"><strong>الحالة:</strong> ✕ ملغي</p>
                <p style="margin: 5px 0;"><strong>التخصص:</strong> ${schedule.specialty}</p>
                <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${formattedDate}</p>
                ${schedule.doctorName ? `<p style="margin: 5px 0;"><strong>الطبيب:</strong> د. ${schedule.doctorName}</p>` : ''}
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">
                ${cancelledByUser 
                    ? 'يمكنك حجز موعد جديد من خلال تطبيق IPARPA في أي وقت.' 
                    : 'نأسف للإزعاج ونقدر تفهمك. يمكنك حجز موعد جديد من خلال تطبيق IPARPA أو الاتصال بنا مباشرة.'}
            </p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://iparpa.com/booking" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">حجز موعد جديد</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مع تمنياتنا لك بالصحة والعافية،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${patient.name}،
    
    ${cancelledByUser ? 'لقد قمت بإلغاء موعدك التالي:' : 'نود إعلامك بأنه تم إلغاء موعدك التالي:'}
    
    الحالة: ملغي
    التخصص: ${schedule.specialty}
    التاريخ: ${formattedDate}
    ${schedule.doctorName ? `الطبيب: د. ${schedule.doctorName}` : ''}
    
    ${cancelledByUser 
        ? 'يمكنك حجز موعد جديد من خلال تطبيق IPARPA في أي وقت.' 
        : 'نأسف للإزعاج ونقدر تفهمك. يمكنك حجز موعد جديد من خلال تطبيق IPARPA أو الاتصال بنا مباشرة.'}
    
    حجز موعد جديد: https://iparpa.com/booking
    
    مع تمنياتنا لك بالصحة والعافية،
    فريق IPARPA
    `;
    
    return await sendEmail({
        to: patient.email,
        subject,
        text: textContent,
        html: htmlContent
    });
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendPasswordResetEmail = async (to, name, resetToken) => {
    const resetLink = `https://iparpa.com/reset-password?token=${resetToken}`;
    const subject = 'إعادة تعيين كلمة المرور - IPARPA';
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${name}،</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            
            <p style="font-size: 16px; line-height: 1.6;">يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="${resetLink}" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">هذا الرابط صالح لمدة 30 دقيقة فقط.</p>
            
            <p style="font-size: 16px; line-height: 1.6;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بنا على الفور.</p>
            
            <p style="font-size: 16px; line-height: 1.6;">مع أطيب التحيات،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${name}،
    
    لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
    
    يرجى استخدام الرابط التالي لإعادة تعيين كلمة المرور:
    ${resetLink}
    
    هذا الرابط صالح لمدة 30 دقيقة فقط.
    
    إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بنا على الفور.
    
    مع أطيب التحيات،
    فريق IPARPA
    `;
    
    return await sendEmail({
        to,
        subject,
        text: textContent,
        html: htmlContent
    });
};

/**
 * Send a chat transcript email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {Array} messages - Array of chat messages
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendChatTranscriptEmail = async (to, name, messages) => {
    const subject = 'نسخة من محادثتك الطبية - IPARPA';
    
    // Format messages into HTML
    let messagesHtml = '';
    let messagesText = '';
    
    messages.forEach(msg => {
        const isUser = msg.role === 'user';
        const alignStyle = isUser ? 'text-align: right;' : 'text-align: right;';
        const colorStyle = isUser ? 'background-color: #e6f7ff;' : 'background-color: #f0f0f0;';
        const borderStyle = isUser ? 'border-left: 4px solid #0070c0;' : 'border-left: 4px solid #999;';
        
        messagesHtml += `
            <div style="margin: 10px 0; padding: 10px 15px; border-radius: 8px; ${colorStyle} ${borderStyle} ${alignStyle}">
                <p style="margin: 0;"><strong>${isUser ? 'أنت' : 'المساعد الطبي'}</strong></p>
                <p style="margin: 5px 0;">${msg.content}</p>
            </div>
        `;
        
        messagesText += `${isUser ? 'أنت' : 'المساعد الطبي'}: ${msg.content}\n\n`;
    });
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${name}،</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">فيما يلي نسخة من محادثتك الطبية:</p>
            
            <div style="margin: 20px 0;">
                ${messagesHtml}
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">يمكنك الوصول إلى محادثاتك السابقة في أي وقت من خلال حسابك.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://iparpa.com/chat" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">بدء محادثة جديدة</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مع تمنياتنا لك بالصحة والعافية،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
            <p>ملاحظة: هذه المحادثة لا تعتبر بديلاً عن استشارة الطبيب.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${name}،
    
    فيما يلي نسخة من محادثتك الطبية:
    
    ${messagesText}
    
    يمكنك الوصول إلى محادثاتك السابقة في أي وقت من خلال حسابك.
    
    بدء محادثة جديدة: https://iparpa.com/chat
    
    مع تمنياتنا لك بالصحة والعافية،
    فريق IPARPA
    
    ملاحظة: هذه المحادثة لا تعتبر بديلاً عن استشارة الطبيب.
    `;
    
    return await sendEmail({
        to,
        subject,
        text: textContent,
        html: htmlContent
    });
};

/**
 * Utility function to obscure email address for logging in production
 * @param {string} email - The email to obscure
 * @returns {string} - Obscured email
 */
const obscureEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return 'invalid-email';
    }
    
    const [localPart, domain] = email.split('@');
    
    // Obscure username part (show only first and last character)
    let obscuredLocalPart = localPart;
    if (localPart.length > 2) {
        obscuredLocalPart = `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`;
    }
    
    // Obscure domain part except the TLD
    const domainParts = domain.split('.');
    const tld = domainParts.pop();
    let obscuredDomain = domainParts.join('.'); 
    
    if (obscuredDomain.length > 2) {
        obscuredDomain = `${obscuredDomain[0]}${'*'.repeat(obscuredDomain.length - 2)}${obscuredDomain[obscuredDomain.length - 1]}`;
    }
    
    return `${obscuredLocalPart}@${obscuredDomain}.${tld}`;
};

/**
 * Send a booking request confirmation email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} specialty - Medical specialty requested
 * @param {string} notes - Additional notes from the user
 * @returns {Promise<Object>} - Response from sendEmail function
 */
const sendBookingRequestEmail = async (to, name, specialty, notes) => {
    const subject = 'تم استلام طلب الحجز الخاص بك - IPARPA';
    
    const htmlContent = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0070c0; margin-bottom: 20px;">مرحباً ${name}،</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">نشكرك على تقديم طلب الحجز. لقد استلمنا طلبك، وسنقوم بالبحث عن موعد مناسب لك في أقرب وقت ممكن.</p>
            
            <div style="background-color: #fff8e6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107;">
                <p style="margin: 5px 0;"><strong>الحالة:</strong> ⏳ قيد المعالجة</p>
                <p style="margin: 5px 0;"><strong>التخصص:</strong> ${specialty || 'عام'}</p>
                ${notes ? `<p style="margin: 5px 0;"><strong>ملاحظات:</strong> ${notes}</p>` : ''}
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">سيتم الاتصال بك قريبًا لتأكيد موعدك وتفاصيله.</p>
            
            <p style="font-size: 16px; line-height: 1.6;">إذا كان لديك أي استفسارات، فلا تتردد في التواصل معنا.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://iparpa.com/appointments" style="background-color: #0070c0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">متابعة حالة طلبك</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">مع تمنياتنا لك بالصحة والعافية،<br>فريق IPARPA</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 14px;">
            <p>© 2025 IPARPA. جميع الحقوق محفوظة.</p>
        </div>
    </div>
    `;
    
    const textContent = `
    مرحباً ${name}،
    
    نشكرك على تقديم طلب الحجز. لقد استلمنا طلبك، وسنقوم بالبحث عن موعد مناسب لك في أقرب وقت ممكن.
    
    الحالة: قيد المعالجة
    التخصص: ${specialty || 'عام'}
    ${notes ? `ملاحظات: ${notes}` : ''}
    
    سيتم الاتصال بك قريبًا لتأكيد موعدك وتفاصيله.
    
    إذا كان لديك أي استفسارات، فلا تتردد في التواصل معنا.
    
    متابعة حالة طلبك: https://iparpa.com/appointments
    
    مع تمنياتنا لك بالصحة والعافية،
    فريق IPARPA
    `;
    
    return await sendEmail({
        to,
        subject,
        text: textContent,
        html: htmlContent
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendAppointmentConfirmationEmail,
    sendAppointmentCancellationEmail,
    sendPasswordResetEmail,
    sendChatTranscriptEmail,
    sendBookingRequestEmail
};