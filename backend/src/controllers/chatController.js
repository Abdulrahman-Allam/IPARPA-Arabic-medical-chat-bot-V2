const { ChatMessage } = require('../models/index');
const { generateResponse } = require('../services/geminiService');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { sendSMS, sendBookingRequest } = require('../services/smsService');
const { sendWelcomeEmail, sendBookingRequestEmail } = require('../services/emailService');

// Initialize a new chat session
exports.initChat = async (req, res) => {
    try {
        const sessionId = uuidv4();
        console.log(`Initializing chat session: ${sessionId}`);
        
        // Get user email from token if available
        let userEmail = 'not logged';
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                }
            } catch (tokenError) {
                console.error('Token verification failed:', tokenError);
            }
        }
        
        res.status(200).json({
            success: true,
            sessionId,
            userEmail,
            message: "Chat session initialized"
        });
    } catch (error) {
        console.error('Error initializing chat:', error);
        res.status(500).json({
            success: false,
            message: "Error initializing chat",
            error: error.message
        });
    }
};

// Send a message and get a response
exports.sendMessage = async (req, res) => {
    try {
        const { content, sessionId } = req.body;
        console.log(`Received message in session ${sessionId}: ${content}`);
        
        if (!sessionId || !content) {
            return res.status(400).json({
                success: false,
                message: "SessionId and content are required"
            });
        }
        
        // Get user email from token if available
        let userEmail = 'not logged';
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                }
            } catch (tokenError) {
                console.error('Token verification failed:', tokenError);
            }
        }
        
        // If the message is about booking, handle specially
        if (content.trim().toLowerCase() === "اه احجزلي") {
            const chatMessage = new ChatMessage({
                userEmail,
                userQuestion: content,
                botResponse: "هيتم تحويلك لصفحة الحجز, من فضلك انتظر...",
                sessionId
            });
            
            await chatMessage.save();
            
            return res.status(200).json({
                success: true,
                message: {
                    role: 'assistant',
                    content: chatMessage.botResponse
                },
                redirect: true,
                redirectTo: "/booking"
            });
        }
        
        try {
            // Save the system prompt for the AI
            const systemPrompt = "انت مساعد طبي مصري ذكي, مبتتكلمش غير باللهجة العربية المصرية, بتساعد الناس في انك تجاوبهم على اسألتهم الطبية,خلي جوابك دايما ميعديش سبع سطور ودايما لما يقولولك شكوتهم تقولهم الف سلامة او سلامتك وبعدين ترد عليهم بطريقة رسمية, متقولش يباشا او يا صاحبي او يا زميلي, وكمان تقولهم ايه التحاليل المناسبة اللي الفمروض يعملوها, اي سؤال ملوش علاقة بالطب اعتذر منه ومتجاوبش, ممكن ترد السلام او الترحاب مفيش مشاكل, كل اجوبتك قولها باللهجة المصرية بطريقة رسمية وبأدب, وبناء على الشكوى هتحدد للمريض  ب'حالتك حرجة ويفضل تكشف عند دكتور' او 'حالتك غير حرجة' وخليها بعد الكلام اللي قولته بمسافة اربعة سطور, , وفي نهاية اجابتك دايما اسالهم هل تحب احجزلك لدكتور";
            
            // Get previous conversation for context
            const previousMessages = await ChatMessage.find({ sessionId })
                .sort('timestamp')
                .select('userQuestion botResponse');
            
            // Format messages for the AI
            const aiMessages = [
                { role: 'system', content: systemPrompt },
                ...previousMessages.map(msg => [
                    { role: 'user', content: msg.userQuestion },
                    { role: 'assistant', content: msg.botResponse }
                ]).flat(),
                { role: 'user', content }
            ];
            
            // Generate response
            console.log('Generating response from AI...');
            const responseText = await generateResponse(aiMessages);
            console.log('Response generated successfully');
            
            // Save message and response
            const chatMessage = new ChatMessage({
                userEmail,
                userQuestion: content,
                botResponse: responseText,
                sessionId
            });
            
            await chatMessage.save();
            
            res.status(200).json({
                success: true,
                message: {
                    role: 'assistant',
                    content: responseText
                }
            });
        } catch (aiError) {
            console.error('Error with AI response generation:', aiError);
            // Even if AI fails, save the user question and a fallback response
            const fallbackResponse = "عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.";
            
            const chatMessage = new ChatMessage({
                userEmail,
                userQuestion: content,
                botResponse: fallbackResponse,
                sessionId
            });
            
            await chatMessage.save();
            
            res.status(200).json({
                success: true,
                message: {
                    role: 'assistant',
                    content: fallbackResponse
                }
            });
        }
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            success: false,
            message: "Error processing message",
            error: error.message
        });
    }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log(`Fetching chat history for session: ${sessionId}`);
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "SessionId is required"
            });
        }
        
        const messages = await ChatMessage.find({ sessionId }).sort('timestamp');
        
        // Format the messages for the frontend
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            id: msg._id,
            role: 'user',
            content: msg.userQuestion,
            timestamp: msg.timestamp
        })).concat(messages.map(msg => ({
            _id: msg._id + '-response',
            id: msg._id + '-response',
            role: 'assistant',
            content: msg.botResponse,
            timestamp: new Date(msg.timestamp.getTime() + 1000) // Add 1 second to ensure it appears after user message
        }))).sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`Retrieved ${formattedMessages.length} messages from history`);
        
        res.status(200).json({
            success: true,
            messages: formattedMessages
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching chat history",
            error: error.message
        });
    }
};

// Get user's medical history (all conversations across sessions)
exports.getMedicalHistory = async (req, res) => {
    try {
        // Get user email from token
        let userEmail = null;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                }
            } catch (tokenError) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            }
        }
        
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        // Get all conversations for this user grouped by session
        const conversations = await ChatMessage.find({ userEmail })
            .sort({ timestamp: 1 })
            .select('userQuestion botResponse sessionId timestamp');
        
        // Group by sessionId
        const sessionGroups = {};
        conversations.forEach(msg => {
            if (!sessionGroups[msg.sessionId]) {
                sessionGroups[msg.sessionId] = {
                    sessionId: msg.sessionId,
                    startDate: msg.timestamp,
                    conversations: [],
                    questions: [] // Track questions for context title generation
                };
            }
            
            sessionGroups[msg.sessionId].conversations.push({
                question: msg.userQuestion,
                response: msg.botResponse,
                timestamp: msg.timestamp
            });
            
            // Add to questions array for title generation
            sessionGroups[msg.sessionId].questions.push(msg.userQuestion);
        });
        
        // Generate context title for each session
        const medicalHistory = Object.values(sessionGroups).map(session => {
            // Generate a contextual title
            const contextTitle = generateSessionTitle(session.questions);
            
            return {
                ...session,
                contextTitle
            };
        });
        
        res.status(200).json({
            success: true,
            medicalHistory
        });
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching medical history",
            error: error.message
        });
    }
};

// Get user's chat sessions
exports.getUserSessions = async (req, res) => {
    try {
        // Get user email from token
        let userEmail = null;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                }
            } catch (tokenError) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            }
        }
        
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        // Find all unique sessions for this user
        const sessions = await ChatMessage.aggregate([
            // Match by user email
            { $match: { userEmail } },
            
            // Group by session
            { $group: {
                _id: "$sessionId",
                lastMessageDate: { $max: "$timestamp" },
                messageCount: { $sum: 1 },
                firstQuestion: { $first: "$userQuestion" },
                allQuestions: { $push: "$userQuestion" }
            }},
            
            // Project to get the right format
            { $project: {
                _id: 0,
                sessionId: "$_id",
                lastMessageDate: 1,
                messageCount: 1,
                firstQuestion: 1,
                allQuestions: 1
            }},
            
            // Sort by most recent sessions first
            { $sort: { lastMessageDate: -1 } }
        ]);
        
        // Process each session to generate a descriptive title
        const processedSessions = sessions.map(session => {
            // Generate a title based on the first question or find a medical-related keyword
            let contextTitle = generateSessionTitle(session.allQuestions);
            
            return {
                ...session,
                contextTitle
            };
        });
        
        res.status(200).json({
            success: true,
            sessions: processedSessions
        });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user sessions",
            error: error.message
        });
    }
};

// Helper function to generate a descriptive title from chat questions
function generateSessionTitle(questions) {
    if (!questions || questions.length === 0) {
        return "محادثة جديدة";
    }
    
    // Combined questions for better topic analysis
    const combinedText = questions.join(' ');
    
    // Topics and their related keywords in Arabic
    const medicalTopics = {
        "صداع": ["صداع", "ألم الرأس", "صداع نصفي", "ميجرين", "الم في الراس"],
        "معدة": ["معدة", "إسهال", "إمساك", "حرقة", "قولون", "بطن", "غثيان", "قيء"],
        "قلب": ["قلب", "ضغط الدم", "خفقان", "ذبحة", "صدر", "نبض"],
        "حساسية": ["حساسية", "طفح جلدي", "حكة", "هرش", "أكزيما", "احمرار"],
        "تنفس": ["تنفس", "ربو", "سعال", "كحة", "ضيق تنفس", "انفلونزا", "زكام", "كورونا", "كوفيد", "كوڤيد"],
        "عظام": ["عظام", "مفاصل", "كسر", "ظهر", "رقبة", "ركبة"],
        "عيون": ["عيون", "عين", "رؤية", "نظر", "ضبابية"],
        "أسنان": ["أسنان", "ضرس", "لثة", "تسوس", "طربوش"],
        "نفسية": ["إكتئاب", "قلق", "توتر", "نفسية", "نوم", "أرق"],
        "أطفال": ["طفل", "رضيع", "حرارة", "تطعيم", "طفح"],
        "حمل": ["حمل", "ولادة", "رضاعة", "جنين", "دورة شهرية"]
    };
    
    // Check for topics in the text
    for (const [topic, keywords] of Object.entries(medicalTopics)) {
        if (keywords.some(keyword => combinedText.includes(keyword))) {
            return `استشارة حول ${topic}`;
        }
    }
    
    // If no specific topic found, use the first question but truncate it
    const firstQuestion = questions[0];
    if (firstQuestion.length > 25) {
        return firstQuestion.substring(0, 25) + "...";
    }
    
    return firstQuestion;
}

// Send booking SMS
exports.sendBookingSMS = async (req, res) => {
    try {
        const { phone, name, messageContent, specialty, email, age } = req.body;
        
        if (!phone || !name) {
            return res.status(400).json({
                success: false,
                message: "Phone number and name are required"
            });
        }
        
        // Create the SMS message
        const bookingRequestData = {
            phone,
            name,
            specialty: specialty || "General",
            age: age || "",
            notes: messageContent.substring(0, 100)
        };
        
        // Send the SMS
        const smsResult = await sendBookingRequest(bookingRequestData);
        
        // Get user ID if authenticated
        let userId = null;
        if (req.user && req.user.userId) {
            userId = req.user.userId;
        }
        
        // Import Appointment model to fix reference error
        const { Appointment } = require('../models/index');
        
        // Create a new appointment record with the new structure
        const appointment = new Appointment({
            patient: {
                name,
                phone,
                age: age || 0, // Default age if not provided
                email: email || null, // Include email if provided
                userId: userId
            },
            schedule: {
                doctorName: 'To be assigned', // These will be assigned later
                specialty: specialty || 'General',
                appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
                startTime: '09:00',
                endTime: '10:00',
                location: 'To be determined'
            },
            status: 'pending', // Explicitly set to pending for SMS bookings
            notes: messageContent.substring(0, 500) // Store part of the message as notes
        });
        
        await appointment.save();
        
        // Send booking request confirmation email if email is provided
        if (email) {
            try {
                // Send a booking request confirmation email instead of welcome email
                await sendBookingRequestEmail(email, name, specialty || 'General', messageContent.substring(0, 200));
                console.log(`Booking request confirmation email sent to: ${email}`);
            } catch (emailError) {
                console.error('Failed to send booking request email:', emailError);
                // Don't let email failure affect the API response
            }
        }
        
        res.status(200).json({
            success: true,
            message: "Booking request sent successfully",
            simulated: smsResult.simulated,
            appointment: appointment._id
        });
    } catch (error) {
        console.error('Error sending booking request:', error);
        res.status(500).json({
            success: false,
            message: "Error sending booking request",
            error: error.message
        });
    }
};
