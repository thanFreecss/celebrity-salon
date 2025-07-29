const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide service name'],
        trim: true,
        unique: true
    },
    serviceId: {
        type: String,
        required: [true, 'Please provide service ID'],
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Please provide service category'],
        enum: ['manipedi', 'massage', 'hair', 'lashes']
    },
    description: {
        type: String,
        required: [true, 'Please provide service description'],
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide service price']
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide service duration']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        required: [true, 'Please provide service image']
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

module.exports = mongoose.model('Service', serviceSchema); 