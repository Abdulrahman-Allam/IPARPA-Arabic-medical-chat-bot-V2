const { User } = require('../models/index');
const bcrypt = require('bcryptjs');

// Create admin user if it doesn't exist
exports.createAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@gmail.com' });
        
        if (!adminExists) {
            // Create admin user - password will be hashed by the pre-save hook
            const admin = new User({
                name: 'Admin',
                age: 30,
                email: 'admin@gmail.com',
                phone: '0000000000',
                password: 'abc123',
                role: 'admin'
            });
            
            await admin.save();
            console.log('Admin user created successfully');
            
            // Let's try to verify we can login with this admin
            const adminCheck = await User.findOne({ email: 'admin@gmail.com' });
            const passwordCheck = await adminCheck.comparePassword('abc123');
            console.log(`Admin password verification check: ${passwordCheck}`);
        } else {
            console.log('Admin user already exists');
            
            // For existing admin, verify if password works - if not, reset it
            const passwordCheck = await adminExists.comparePassword('abc123');
            console.log(`Existing admin password verification check: ${passwordCheck}`);
            
            if (!passwordCheck) {
                // Reset password if it doesn't work
                await exports.resetAdminPassword();
            }
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Reset admin password (for emergency use)
exports.resetAdminPassword = async () => {
    try {
        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (admin) {
            admin.password = 'abc123'; // This will be hashed by the pre-save hook
            await admin.save();
            console.log('Admin password reset successfully');
            return true;
        } else {
            console.log('Admin user not found for password reset');
            return false;
        }
    } catch (error) {
        console.error('Error resetting admin password:', error);
        return false;
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
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
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Validate role
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        user.role = role;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user role",
            error: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Don't allow deleting the main admin
        if (user.email === 'admin@gmail.com') {
            return res.status(403).json({
                success: false,
                message: "Cannot delete the main admin user"
            });
        }
        
        await user.remove();
        
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};
