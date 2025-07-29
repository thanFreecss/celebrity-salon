const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Test route to check if the route is being hit
router.put('/change-password-test', (req, res) => {
    console.log('=== TEST ROUTE HIT ===');
    res.json({ success: true, message: 'Test route working' });
});

// Test route without authentication
router.put('/profile-test', (req, res) => {
    console.log('=== PROFILE TEST ROUTE HIT ===');
    console.log('Request body:', req.body);
    res.json({ success: true, message: 'Profile test route working', data: req.body });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        console.log('Profile update request received:', { 
            userId: req.user.id, 
            updateData: req.body 
        });

        const { name, email, phone } = req.body;
        
        console.log('Extracted data:', { name, email, phone });
        console.log('Phone number type:', typeof phone, 'Length:', phone ? phone.length : 'undefined');

        // Validate input
        if (!name && !email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update'
            });
        }

        // Get user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) {
            // Validate phone number format
            if (!/^[0-9]{11}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 11 digits'
                });
            }
            user.phone = phone;
        }
        // Note: email updates might need additional validation

        try {
            await user.save();
        } catch (saveError) {
            console.error('Save error:', saveError);
            
            // Handle validation errors
            if (saveError.name === 'ValidationError') {
                const validationErrors = Object.values(saveError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error: ' + validationErrors.join(', ')
                });
            }
            
            throw saveError; // Re-throw other errors
        }

        console.log('Profile updated successfully');
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error in profile update route:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    console.log('=== PASSWORD CHANGE ROUTE STARTED ===');
    try {
        console.log('Password change request received:', { 
            userId: req.user.id, 
            hasCurrentPassword: !!req.body.currentPassword,
            hasNewPassword: !!req.body.newPassword 
        });

        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        console.log('Looking for user with ID:', req.user.id);

        // Get user with password (explicitly select password field)
        let user;
        try {
            user = await User.findById(req.user.id).select('+password');
            console.log('User found:', user ? 'Yes' : 'No', user ? { id: user._id, hasPassword: !!user.password } : 'No user');
        } catch (dbError) {
            console.error('Database error finding user:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error finding user: ' + dbError.message
            });
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.password) {
            console.error('User found but password field is missing');
            return res.status(500).json({
                success: false,
                message: 'User password field is missing'
            });
        }

        console.log('Verifying current password...');
        // Verify current password
        let isMatch;
        try {
            isMatch = await bcrypt.compare(currentPassword, user.password);
            console.log('Password match result:', isMatch);
        } catch (bcryptError) {
            console.error('Bcrypt comparison error:', bcryptError);
            return res.status(500).json({
                success: false,
                message: 'Password comparison error: ' + bcryptError.message
            });
        }
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        console.log('Hashing new password...');
        // Hash new password
        let hashedPassword;
        try {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(newPassword, salt);
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return res.status(500).json({
                success: false,
                message: 'Password hashing error: ' + hashError.message
            });
        }

        console.log('Saving user...');
        // Use updateOne to bypass the pre-save middleware
        try {
            await User.updateOne(
                { _id: user._id },
                { password: hashedPassword }
            );
        } catch (updateError) {
            console.error('Database update error:', updateError);
            return res.status(500).json({
                success: false,
                message: 'Database update error: ' + updateError.message
            });
        }

        console.log('Password changed successfully');
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error in password change route:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only allow users to update their own profile or admin to update any
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { name, email, phone } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.remove();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 