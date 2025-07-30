const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Employee = require('./models/Employee');
const Booking = require('./models/Booking');

const initializeDatabase = async () => {
    try {
        console.log('Starting database initialization...');
        
        // Check if MONGODB_URI is available
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            process.exit(1);
        }

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Create indexes for better performance
        console.log('Creating database indexes...');
        
        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ phone: 1 });
        
        // Service indexes
        await Service.collection.createIndex({ name: 1 });
        await Service.collection.createIndex({ category: 1 });
        
        // Employee indexes
        await Employee.collection.createIndex({ name: 1 });
        await Employee.collection.createIndex({ specialization: 1 });
        
        // Booking indexes
        await Booking.collection.createIndex({ userId: 1 });
        await Booking.collection.createIndex({ serviceId: 1 });
        await Booking.collection.createIndex({ employeeId: 1 });
        await Booking.collection.createIndex({ date: 1 });
        await Booking.collection.createIndex({ status: 1 });

        console.log('Database indexes created successfully');

        // Check if admin user exists, if not create one
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('Creating default admin user...');
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@celebritystyles.com',
                phone: '09123456789',
                password: 'admin123456',
                role: 'admin'
            });
            console.log('Admin user created:', adminUser.email);
        } else {
            console.log('Admin user already exists');
        }

        console.log('Database initialization completed successfully');
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase; 