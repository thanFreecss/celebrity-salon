const mongoose = require('mongoose');
const Counter = require('./Counter');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: Number,
        unique: true,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    mobileNumber: {
        type: String,
        required: [true, 'Please provide your mobile number'],
        match: [/^[0-9]{11}$/, 'Please provide a valid 11-digit phone number']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true
    },
    service: {
        type: String,
        required: [true, 'Please select a service'],
        enum: [
            'manicure', 'pedicure', 'footspa', 'manicure-gel', 'manipedi-gel',
            'pedi-gel-footspa', 'pedi-gel', 'soft-gel-extension', 'foot-massage',
            'hand-massage', 'traditional-hamu', 'glam-hamu', 'airbrush-hamu',
            'classic-lashes', 'cat-eye-lashes', 'wispy-lashes', 'volume-lashes',
            'lash-lift', 'lash-removal', 'brow-shave', 'brow-tint'
        ]
    },
    selectedEmployee: {
        type: String,
        required: false
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Please select an appointment date']
    },
    selectedTime: {
        type: String,
        required: [true, 'Please select a time slot'],
        enum: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    },
    clientNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
    if (this.isNew && !this.bookingId) {
        try {
            // Get the next sequence number
            const counter = await Counter.findOneAndUpdate(
                { name: 'bookingId' },
                { $inc: { sequence: 1 } },
                { new: true, upsert: true }
            );
            
            this.bookingId = counter.sequence;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Index for efficient queries
bookingSchema.index({ appointmentDate: 1, selectedTime: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 }); // Index for booking ID queries

module.exports = mongoose.model('Booking', bookingSchema); 