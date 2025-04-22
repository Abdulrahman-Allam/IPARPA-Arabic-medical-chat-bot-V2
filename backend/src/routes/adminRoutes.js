const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { User } = require('../models/index');

// All routes require authentication and admin role
router.get('/users', authenticateToken, isAdmin, adminController.getAllUsers);
router.get('/users/:id', authenticateToken, isAdmin, adminController.getUserById);
router.put('/users/:id/role', authenticateToken, isAdmin, adminController.updateUserRole);
router.delete('/users/:id', authenticateToken, isAdmin, adminController.deleteUser);

// Admin check route - no auth required, just to verify admin exists
router.get('/check-admin', async (req, res) => {
    try {
        const admin = await User.findOne({ email: 'admin@gmail.com' }).select('-password');
        if (admin) {
            return res.status(200).json({
                success: true,
                message: "Admin user exists",
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Admin user does not exist"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking admin user"
        });
    }
});

module.exports = router;
