const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Service = require('../models/Service');

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/services
// @desc    Create new service (admin only)
// @access  Private
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, serviceId, category, description, price, duration, image } = req.body;

        const service = await Service.create({
            name,
            serviceId,
            category,
            description,
            price,
            duration,
            image
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/services/:id
// @desc    Update service (admin only)
// @access  Private
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const { name, category, description, price, duration, image, isActive } = req.body;

        if (name) service.name = name;
        if (category) service.category = category;
        if (description) service.description = description;
        if (price) service.price = price;
        if (duration) service.duration = duration;
        if (image) service.image = image;
        if (typeof isActive === 'boolean') service.isActive = isActive;

        await service.save();

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (admin only)
// @access  Private
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.remove();

        res.json({
            success: true,
            message: 'Service deleted successfully'
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