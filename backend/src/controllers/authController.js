const { User } = require('../models/index');
const jwt = require('jsonwebtoken');
const { formatEgyptianPhoneNumber } = require('../services/smsService');
const { sendWelcomeEmail } = require('../services/emailService');

// Register a new user
exports.signup = async (req, res) => {
    try {
        const { name, age, email, phone, password } = req.body;
        
        // Check if all required fields are provided
        if (!name || !age || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email address already in use"
            });
        }
        
        // Format the phone number to ensure it has the Egyptian country code
        const formattedPhone = formatEgyptianPhoneNumber(phone);
        
        // Create new user
        const user = new User({
            name,
            age,
            email,
            phone: formattedPhone,
            password
        });
        
        await user.save();
        
        // Create token with a 24-hour expiration (changed from 7d)
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        );
        
        // Send welcome email asynchronously
        try {
            await sendWelcomeEmail(email, name);
            console.log(`Welcome email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't let email failure affect the API response
        }
        
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Add debug log
        console.log(`Login attempt for: ${email}`);
        
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        
        // Find user with the provided email
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if password is correct
        const isMatch = await user.comparePassword(password);
        console.log(`Password match result for ${email}: ${isMatch}`);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        // Create token with a 24-hour expiration (changed from 7d)
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};
