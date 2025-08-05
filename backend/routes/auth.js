const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendPasswordReset, sendOTPVerification } = require('../utils/emailService');

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
// @desc    Send OTP for password reset
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

        // Generate OTP
        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        // Send OTP email
        try {
            const emailResult = await sendOTPVerification({
                email: user.email,
                name: user.name,
                otp: otp
            });

            if (emailResult.success) {
                console.log('OTP email sent successfully to:', email);
                res.json({
                    success: true,
                    message: 'OTP sent successfully! Please check your email.',
                    debug: {
                        otp: otp,
                        email: email
                    }
                });
            } else {
                console.error('Failed to send OTP email:', emailResult.error);
                // Still return success but with debug info
                res.json({
                    success: true,
                    message: 'OTP generated successfully! Please check your email.',
                    debug: {
                        otp: otp,
                        email: email,
                        emailError: emailResult.error
                    }
                });
            }
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            // Still return success but with debug info
            res.json({
                success: true,
                message: 'OTP generated successfully! Please check your email.',
                debug: {
                    otp: otp,
                    email: email,
                    emailError: emailError.message
                }
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for OTP verification');
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, otp } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address'
            });
        }

        // Verify OTP
        if (!user.verifyOTP(otp)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Clear OTP after successful verification
        user.clearOTP();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password after OTP verification
// @access  Public
router.post('/reset-password', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for password reset');
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable'
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

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address'
            });
        }

        // Update password
        user.password = password;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});



module.exports = router; 