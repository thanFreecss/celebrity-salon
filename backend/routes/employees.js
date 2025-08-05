const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Employee = require('../models/Employee');
const mongoose = require('mongoose'); // Added for database connection test

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
        
        let query = { isActive: true };
        
        // Define manicurist services list
        const manicuristServices = [
            'manicure', 'pedicure', 'footspa', 'manicure-gel', 'manipedi-gel',
            'pedi-gel-footspa', 'pedi-gel', 'soft-gel-extension'
        ];
        
        // Check if the selected service is a manicurist service
        if (manicuristServices.includes(serviceId)) {
            // For manicurist services: only show employees with "Manicurist" role
            query.position = 'Manicurist';
            
            // Map services to what the Manicurist actually offers
            let mappedServices = [];
            
            switch (serviceId) {
                case 'manicure':
                case 'pedicure':
                case 'manicure-gel':
                case 'manipedi-gel':
                    // Direct matches - Manicurist has these
                    mappedServices = [serviceId];
                    break;
                case 'footspa':
                    // Map footspa to pedicure (closest match)
                    mappedServices = ['pedicure'];
                    break;
                case 'pedi-gel-footspa':
                    // Map to pedicure and manicure-gel (combination)
                    mappedServices = ['pedicure', 'manicure-gel'];
                    break;
                case 'pedi-gel':
                    // Map to pedicure and manicure-gel (combination)
                    mappedServices = ['pedicure', 'manicure-gel'];
                    break;
                case 'soft-gel-extension':
                    // Map to manicure-gel (closest match)
                    mappedServices = ['manicure-gel'];
                    break;
                default:
                    mappedServices = [serviceId];
            }
            
            // Find employees who offer any of the mapped services
            query.specialties = { $in: mappedServices };
        } else {
            // For other services, find employees who have the specific service in their specialties
            query.specialties = serviceId;
        }

        const employees = await Employee.find(query);

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

// Test route to check database connection
router.get('/test', async (req, res) => {
    try {
        console.log('Testing database connection...');
        
        // Test if we can connect to the database
        const dbState = mongoose.connection.readyState;
        console.log('Database connection state:', dbState);
        
        // Test if we can create a simple document
        const testEmployee = new Employee({
            name: 'Test Employee',
            employeeId: 'TEST001',
            email: 'test@test.com',
            phone: '09123456789',
            position: 'Manicurist',
            specialties: ['manicure']
        });
        
        console.log('Test employee object created:', testEmployee);
        
        res.json({
            success: true,
            message: 'Database connection test successful',
            dbState: dbState,
            testEmployee: testEmployee
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message
        });
    }
});

// @route   POST /api/employees
// @desc    Create new employee (admin only)
// @access  Private
router.post('/', protect, admin, async (req, res) => {
    try {
        console.log('Creating employee with data:', req.body);
        
        const { name, employeeId, email, phone, specialties } = req.body;

        // Simple validation
        if (!name || !employeeId || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, Employee ID, and Phone are required'
            });
        }

        const employeeData = {
            name: name,
            employeeId: employeeId,
            email: email || `${employeeId}@celebritystyles.com`,
            phone: phone,
            position: 'Employee',
            specialties: specialties || []
        };

        console.log('Final employee data:', employeeData);

        const employee = await Employee.create(employeeData);

        console.log('Employee created successfully:', employee);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
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