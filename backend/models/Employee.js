const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide employee name'],
        trim: true
    },
    employeeId: {
        type: String,
        required: [true, 'Please provide employee ID'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide employee email'],
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide employee phone number']
    },
    specialties: [{
        type: String,
        enum: [
            'manicure', 'pedicure', 'footspa', 'manicure-gel', 'manipedi-gel',
            'pedi-gel-footspa', 'pedi-gel', 'soft-gel-extension', 'foot-massage',
            'hand-massage', 'traditional-hamu', 'glam-hamu', 'airbrush-hamu',
            'classic-lashes', 'cat-eye-lashes', 'wispy-lashes', 'volume-lashes',
            'lash-lift', 'lash-removal', 'brow-shave', 'brow-tint'
        ]
    }],
    position: {
        type: String,
        required: [true, 'Please provide employee position'],
        enum: ['Manicurist', 'Hair Stylist', 'Makeup Artist', 'Lash Specialist', 'Massage Therapist']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    workingHours: {
        start: {
            type: String,
            default: '08:00'
        },
        end: {
            type: String,
            default: '17:00'
        }
    },
    daysOff: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
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

module.exports = mongoose.model('Employee', employeeSchema); 