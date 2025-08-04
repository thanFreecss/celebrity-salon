const mongoose = require('mongoose');
const Counter = require('./models/Counter');
require('dotenv').config({ path: './config.env' });

async function initBookingCounter() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if counter already exists
        const existingCounter = await Counter.findOne({ name: 'bookingId' });
        
        if (existingCounter) {
            console.log(`✅ Booking ID counter already exists with sequence: ${existingCounter.sequence}`);
        } else {
            // Create new counter starting from 0 (first booking will be 1)
            const counter = await Counter.create({
                name: 'bookingId',
                sequence: 0
            });
            console.log(`✅ Booking ID counter initialized with sequence: ${counter.sequence}`);
        }

        console.log('🎉 Booking ID counter setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing booking counter:', error);
        process.exit(1);
    }
}

// Run the initialization
initBookingCounter(); 