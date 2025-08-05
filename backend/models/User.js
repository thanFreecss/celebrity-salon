const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        match: [/^[0-9]{11}$/, 'Please provide a valid 11-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // OTP fields
    otpCode: String,
    otpExpire: Date,
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

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate OTP code
userSchema.methods.generateOTP = function() {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expire time (5 minutes)
    this.otpCode = otp;
    this.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    return otp;
};

// Verify OTP code
userSchema.methods.verifyOTP = function(enteredOTP) {
    if (!this.otpCode || !this.otpExpire) {
        return false;
    }
    
    // Check if OTP is expired
    if (Date.now() > this.otpExpire) {
        return false;
    }
    
    // Check if OTP matches
    return this.otpCode === enteredOTP;
};

// Clear OTP after use
userSchema.methods.clearOTP = function() {
    this.otpCode = undefined;
    this.otpExpire = undefined;
};

module.exports = mongoose.model('User', userSchema); 