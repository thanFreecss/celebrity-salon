const mongoose = require('mongoose');

const beforeAfterSchema = new mongoose.Schema({
    beforeImage: {
        type: String,
        required: true,
        trim: true
    },
    afterImage: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add index for better query performance
beforeAfterSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('BeforeAfter', beforeAfterSchema); 