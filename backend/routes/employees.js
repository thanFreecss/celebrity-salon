const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Employee = require('../models/Employee');

// @route   GET /api/employees
// @desc    Get all employees
// @access  Public
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true });
        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/employees/service/:serviceId
// @desc    Get employees by service
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        
        // Find employees who either:
        // 1. Have the specific service in their specialties, OR
        // 2. Have no specialties assigned (empty array) - these can work any service
        const employees = await Employee.find({
            isActive: true,
            $or: [
                { specialties: serviceId },
                { specialties: { $size: 0 } }  // Empty specialties array
            ]
        });

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/employees
// @desc    Create new employee (admin only)
// @access  Private
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, employeeId, email, phone, specialties, position, workingHours, daysOff } = req.body;

        const employee = await Employee.create({
            name,
            employeeId,
            email,
            phone,
            specialties,
            position,
            workingHours,
            daysOff
        });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/employees/:id
// @desc    Update employee (admin only)
// @access  Private
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const { name, email, phone, specialties, position, workingHours, daysOff, isActive } = req.body;

        if (name) employee.name = name;
        if (email) employee.email = email;
        if (phone) employee.phone = phone;
        if (specialties) employee.specialties = specialties;
        if (position) employee.position = position;
        if (workingHours) employee.workingHours = workingHours;
        if (daysOff) employee.daysOff = daysOff;
        if (typeof isActive === 'boolean') employee.isActive = isActive;

        await employee.save();

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (admin only)
// @access  Private
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        await Employee.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Employee deleted successfully'
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