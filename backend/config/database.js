const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGODB_URI is available
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            throw new Error('Database URI not configured');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // Increased timeout for cloud connections
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 1,  // Minimum number of connections in the pool
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Full error:', error);
        // Don't exit the process, let the server continue running
        console.log('Server will continue without database connection');
    }
};

module.exports = connectDB; 