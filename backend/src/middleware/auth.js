const jwt = require('jsonwebtoken');
const { User } = require('../models/index'); // Adjust the path as necessary

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. No token provided."
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            
            // More descriptive error messages based on error type
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please login again.",
                    expired: true
                });
            }
            
            return res.status(401).json({
                success: false,
                message: "Invalid token. Authentication failed."
            });
        }
        
        req.user = decoded;
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    checkRole
};