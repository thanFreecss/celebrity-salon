const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Service pricing data
const servicePricing = {
    'manicure': 150,
    'pedicure': 199,
    'footspa': 499,
    'manicure-gel': 499,
    'manipedi-gel': 849,
    'pedi-gel-footspa': 849,
    'pedi-gel': 499,
    'soft-gel-extension': 999,
    'foot-massage': 150,
    'hand-massage': 150,
    'traditional-hamu': 1000,
    'glam-hamu': 1500,
    'airbrush-hamu': 2000,
    'classic-lashes': 499,
    'cat-eye-lashes': 599,
    'wispy-lashes': 599,
    'volume-lashes': 699,
    'lash-lift': 399,
    'lash-removal': 100,
    'brow-shave': 50,
    'brow-tint': 600
};

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (with optional authentication)
router.post('/', [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('mobileNumber').matches(/^[0-9]{11}$/).withMessage('Please provide a valid 11-digit phone number'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('service').isIn(Object.keys(servicePricing)).withMessage('Please select a valid service'),
    body('selectedEmployee').optional(),
    body('appointmentDate').isISO8601().withMessage('Please provide a valid date'),
    body('selectedTime').isIn(['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']).withMessage('Please select a valid time slot')
], async (req, res) => {
    // Optional authentication - try to get user if token is provided
    let user = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.log('Optional auth failed, continuing as anonymous user');
        }
    }
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            fullName,
            mobileNumber,
            email,
            service,
            selectedEmployee,
            appointmentDate,
            selectedTime,
            clientNotes
        } = req.body;

        // Check if the time slot is available
        const existingBooking = await Booking.findOne({
            appointmentDate: new Date(appointmentDate),
            selectedTime,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please select another time.'
            });
        }

        // Calculate total amount
        const totalAmount = servicePricing[service] || 0;

        // Create booking
        console.log('Creating booking with user:', user ? user._id : 'No user (anonymous)');
        const booking = await Booking.create({
            user: user ? user._id : null, // Use authenticated user if available
            fullName,
            mobileNumber,
            email,
            service,
            selectedEmployee,
            appointmentDate: new Date(appointmentDate),
            selectedTime,
            clientNotes,
            totalAmount
        });
        console.log('Booking created with ID:', booking._id);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/bookings/user
// @desc    Get current user's bookings
// @access  Private
router.get('/user', protect, async (req, res) => {
    try {
        console.log('User requesting bookings:', req.user.id);
        console.log('User object:', req.user);
        console.log('User ID type:', typeof req.user.id);
        console.log('User ID value:', req.user.id);
        
        // Check if user ID is valid
        if (!req.user.id) {
            console.error('No user ID found');
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Test database connection first
        console.log('Testing database connection...');
        const testQuery = await Booking.findOne();
        console.log('Database connection test result:', testQuery ? 'Success' : 'No bookings found');

        // First, try to find bookings by user ID only
        console.log('Searching for bookings with user ID:', req.user.id);
        let userBookings = [];
        try {
            userBookings = await Booking.find({ user: req.user.id });
            console.log('Bookings found by user ID:', userBookings.length);
        } catch (userError) {
            console.error('Error finding bookings by user ID:', userError);
        }

        // Then, try to find bookings by email
        console.log('Searching for bookings with email:', req.user.email);
        let emailBookings = [];
        try {
            emailBookings = await Booking.find({ email: req.user.email });
            console.log('Bookings found by email:', emailBookings.length);
        } catch (emailError) {
            console.error('Error finding bookings by email:', emailError);
        }

        // Combine and deduplicate bookings
        const allBookings = [...userBookings, ...emailBookings];
        const uniqueBookings = allBookings.filter((booking, index, self) => 
            index === self.findIndex(b => b._id.toString() === booking._id.toString())
        );

        console.log('Total unique bookings for user:', uniqueBookings.length);

        res.json({
            success: true,
            data: uniqueBookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private
router.put('/:id', protect, [
    body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = req.body.status;
        booking.updatedAt = Date.now();

        await booking.save();

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        await booking.remove();

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking (user can only cancel their own bookings)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if the booking belongs to the current user
        if (booking.user && booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled (only pending or confirmed bookings)
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled'
            });
        }

        booking.status = 'cancelled';
        booking.updatedAt = Date.now();

        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
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