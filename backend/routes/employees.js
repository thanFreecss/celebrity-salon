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
        const { appointmentDate } = req.query; // Get appointment date from query params
        
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

        let employees = await Employee.find(query);

        // Filter out employees who are on leave on the appointment date
        if (appointmentDate) {
            const appointmentDateObj = new Date(appointmentDate);
            appointmentDateObj.setHours(0, 0, 0, 0);
            
            employees = employees.filter(employee => {
                // Check if employee has any leave dates that match the appointment date
                const isOnLeave = employee.leaveDates.some(leaveDate => {
                    const leaveDateObj = new Date(leaveDate);
                    leaveDateObj.setHours(0, 0, 0, 0);
                    return leaveDateObj.getTime() === appointmentDateObj.getTime();
                });
                
                return !isOnLeave;
            });
        }

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

// @route   PUT /api/employees/:id/leave-dates
// @desc    Add leave dates to employee (admin only)
// @access  Private
router.put('/:id/leave-dates', protect, admin, async (req, res) => {
    console.log('PUT /api/employees/:id/leave-dates called');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    try {
        const employee = await Employee.findById(req.params.id);
        console.log('Employee found:', employee ? 'Yes' : 'No');

        if (!employee) {
            console.log('Employee not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const { leaveDates } = req.body;
        console.log('Leave dates from request:', leaveDates);

        if (!leaveDates || !Array.isArray(leaveDates)) {
            console.log('Invalid leave dates format');
            return res.status(400).json({
                success: false,
                message: 'Leave dates must be an array'
            });
        }

        // Validate dates are at least 15 days ahead from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date();
        minDate.setDate(today.getDate() + 15); // 15 days minimum

        const validDates = leaveDates.filter(date => {
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            return checkDate >= minDate;
        });

        console.log('Valid dates:', validDates);

        if (validDates.length === 0) {
            console.log('No valid dates provided');
            return res.status(400).json({
                success: false,
                message: 'No valid leave dates provided. Dates must be scheduled at least 15 days in advance.'
            });
        }

        // Helper function to get the week start (Monday) for a given date
        function getWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            return new Date(d.setDate(diff));
        }

        // Helper function to check if two dates are in the same week (Monday to Sunday)
        function isSameWeek(date1, date2) {
            const week1 = getWeekStart(date1);
            const week2 = getWeekStart(date2);
            return week1.getTime() === week2.getTime();
        }

        // Helper function to check if employee already has a leave in the same week
        function hasLeaveInSameWeek(leaveDates, newDate) {
            if (!leaveDates || leaveDates.length === 0) {
                return false;
            }
            
            return leaveDates.some(existingDate => {
                return isSameWeek(new Date(existingDate), new Date(newDate));
            });
        }

        // Backend validation: Check for duplicate dates and same week conflicts
        const existingDates = employee.leaveDates.map(date => date.toISOString().split('T')[0]);
        const newDates = validDates.filter(date => {
            const dateStr = new Date(date).toISOString().split('T')[0];
            
            // Check for exact duplicate dates
            if (existingDates.includes(dateStr)) {
                return false;
            }
            
            // Check for same week conflicts
            if (hasLeaveInSameWeek(employee.leaveDates, date)) {
                return false;
            }
            
            return true;
        });

        console.log('New dates to add:', newDates);

        if (newDates.length === 0) {
            console.log('No valid dates to add (duplicates or same week conflicts)');
            return res.status(400).json({
                success: false,
                message: 'This employee already has a leave scheduled for this week.'
            });
        }

        employee.leaveDates.push(...newDates);
        await employee.save();
        console.log('Employee saved successfully');

        res.json({
            success: true,
            message: `${newDates.length} leave date(s) added successfully`,
            data: employee
        });
    } catch (error) {
        console.error('Error in PUT /api/employees/:id/leave-dates:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/employees/:id/leave-dates
// @desc    Remove leave dates from employee (admin only)
// @access  Private
router.delete('/:id/leave-dates', protect, admin, async (req, res) => {
    console.log('DELETE /api/employees/:id/leave-dates called');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    try {
        const employee = await Employee.findById(req.params.id);
        console.log('Employee found:', employee ? 'Yes' : 'No');

        if (!employee) {
            console.log('Employee not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const { leaveDates } = req.body;
        console.log('Leave dates to remove:', leaveDates);

        if (!leaveDates || !Array.isArray(leaveDates)) {
            console.log('Invalid leave dates format');
            return res.status(400).json({
                success: false,
                message: 'Leave dates must be an array'
            });
        }

        // Remove specified dates
        const datesToRemove = leaveDates.map(date => new Date(date).toISOString().split('T')[0]);
        const originalCount = employee.leaveDates.length;
        
        employee.leaveDates = employee.leaveDates.filter(date => {
            const dateStr = date.toISOString().split('T')[0];
            return !datesToRemove.includes(dateStr);
        });

        await employee.save();
        console.log('Employee saved successfully');

        const removedCount = originalCount - employee.leaveDates.length;
        console.log('Removed count:', removedCount);

        res.json({
            success: true,
            message: `${removedCount} leave date(s) removed successfully`,
            data: employee
        });
    } catch (error) {
        console.error('Error in DELETE /api/employees/:id/leave-dates:', error);
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