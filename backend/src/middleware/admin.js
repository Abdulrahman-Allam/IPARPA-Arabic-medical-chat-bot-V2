const { User } = require('../models/index');

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
    try {
        // req.user should be set by the authenticateToken middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        // Get the user from the database
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        
        // User is admin, proceed
        next();
    } catch (error) {
        console.error('Admin authorization error:', error);
        return res.status(500).json({
            success: false,
            message: "Error in admin authorization",
            error: error.message
        });
    }
};

module.exports = { isAdmin };
