const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendPasswordReset } = require('../utils/emailService');

// Check database connection
const checkDBConnection = () => {
    return mongoose.connection.readyState === 1;
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[0-9]{11}$/).withMessage('Please provide a valid 11-digit phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for register request');
            return res.status(503).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for login request');
            return res.status(503).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User found:', user.name, 'Role:', user.role);

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('Login successful for:', user.name);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for me request');
            return res.status(503).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const user = await User.findById(req.user.id);
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

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for forgot password request');
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable. Please try again later or contact support if the issue persists.',
                error: 'Database connection not available',
                retryAfter: 30 // Suggest retry after 30 seconds
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? process.env.FRONTEND_URL || 'https://celebrity-styles-frontend.onrender.com'
            : `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${baseUrl}/reset-password.html?token=${resetToken}`;

        // Email data
        const emailData = {
            name: user.name,
            email: user.email,
            resetUrl: resetUrl
        };

        // For now, just return success without sending email
        // TODO: Configure email settings properly
        console.log('Password reset token generated:', resetToken);
        console.log('Reset URL would be:', resetUrl);
        
        res.json({
            success: true,
            message: 'Password reset link generated successfully. Check console for reset URL.',
            debug: {
                resetUrl: resetUrl,
                token: resetToken
            }
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for reset password request');
            return res.status(503).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        // Find user by token and check if token is expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 