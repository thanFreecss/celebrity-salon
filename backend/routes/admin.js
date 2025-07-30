const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');

// Check database connection
const checkDBConnection = () => {
    return mongoose.connection.readyState === 1;
};

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        // Check database connection first
        if (!checkDBConnection()) {
            console.log('Database not connected for admin dashboard request');
            return res.status(503).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Get total bookings
        const totalBookings = await Booking.countDocuments();
        
        // Get pending bookings
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        
        // Get confirmed bookings
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        
        // Get completed bookings
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        
        // Get total users
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Get total employees
        const totalEmployees = await Employee.countDocuments({ isActive: true });
        
        // Get total services
        const totalServices = await Service.countDocuments({ isActive: true });
        
        // Get recent bookings
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // Get today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysBookings = await Booking.find({
            appointmentDate: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('user', 'name email');

        res.json({
            success: true,
            data: {
                stats: {
                    totalBookings,
                    pendingBookings,
                    confirmedBookings,
                    completedBookings,
                    totalUsers,
                    totalEmployees,
                    totalServices
                },
                recentBookings,
                todaysBookings
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters
// @access  Private (Admin only)
router.get('/bookings', protect, admin, async (req, res) => {
    try {
        const { status, date, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        
        if (status) filter.status = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.appointmentDate = { $gte: startDate, $lt: endDate };
        }

        const skip = (page - 1) * limit;
        
        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        // Get employee information for each booking
        const bookingsWithEmployeeInfo = await Promise.all(bookings.map(async (booking) => {
            const bookingObj = booking.toObject();
            
            // If selectedEmployee is an ObjectId, populate it
            if (booking.selectedEmployee && mongoose.Types.ObjectId.isValid(booking.selectedEmployee)) {
                try {
                    const employee = await Employee.findById(booking.selectedEmployee);
                    bookingObj.stylistName = employee ? employee.name : 'Unknown Stylist';
                    bookingObj.stylistId = booking.selectedEmployee;
                } catch (error) {
                    console.error('Error fetching employee:', error);
                    bookingObj.stylistName = 'Unknown Stylist';
                    bookingObj.stylistId = booking.selectedEmployee;
                }
            } else {
                // If selectedEmployee is a string (name), use it directly
                bookingObj.stylistName = booking.selectedEmployee || 'No Stylist Assigned';
                bookingObj.stylistId = booking.selectedEmployee;
            }
            
            return bookingObj;
        }));

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            data: bookingsWithEmployeeInfo,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin only)
router.put('/bookings/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const previousStatus = booking.status;
        booking.status = status;
        await booking.save();

        // Send email notifications based on status change
        let emailResult = null;
        
        if (status === 'confirmed' && previousStatus !== 'confirmed') {
            // Get stylist name if available
            let stylistName = null;
            if (booking.selectedEmployee) {
                try {
                    const employee = await Employee.findById(booking.selectedEmployee);
                    stylistName = employee ? employee.name : null;
                } catch (error) {
                    console.error('Error fetching employee for email:', error);
                }
            }

            const emailData = {
                fullName: booking.fullName,
                email: booking.email,
                service: booking.service,
                appointmentDate: booking.appointmentDate,
                selectedTime: booking.selectedTime,
                totalAmount: booking.totalAmount,
                stylistName: stylistName
            };

            emailResult = await sendBookingConfirmation(emailData);
            
            if (emailResult.success) {
                console.log('Confirmation email sent successfully to:', booking.email);
            } else {
                console.error('Failed to send confirmation email:', emailResult.error);
            }
        } else if (status === 'cancelled' && previousStatus !== 'cancelled') {
            const emailData = {
                fullName: booking.fullName,
                email: booking.email,
                service: booking.service,
                appointmentDate: booking.appointmentDate,
                selectedTime: booking.selectedTime
            };

            emailResult = await sendBookingCancellation(emailData);
            
            if (emailResult.success) {
                console.log('Cancellation email sent successfully to:', booking.email);
            } else {
                console.error('Failed to send cancellation email:', emailResult.error);
            }
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking,
            emailSent: emailResult ? emailResult.success : false
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete a booking
// @access  Private (Admin only)
router.delete('/bookings/:id', protect, admin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        await Booking.findByIdAndDelete(req.params.id);

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

// @route   GET /api/admin/reports
// @desc    Get booking reports
// @access  Private (Admin only)
router.get('/reports', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const filter = {};
        
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get bookings by status
        const bookingsByStatus = await Booking.aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get bookings by service
        const bookingsByService = await Booking.aggregate([
            { $match: filter },
            { $group: { _id: '$service', count: { $sum: 1 } } }
        ]);

        // Get total revenue
        const revenue = await Booking.aggregate([
            { $match: { ...filter, status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            data: {
                bookingsByStatus,
                bookingsByService,
                totalRevenue: revenue[0]?.total || 0
            }
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