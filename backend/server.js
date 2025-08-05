const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');
const mongoose = require('mongoose'); // Added for database status

// Load environment variables
dotenv.config({ path: './config.env' });

// Initialize express app
const app = express();

// Connect to database (but don't block server startup)
connectDB().catch(err => {
    console.log('Database connection failed, but server will continue');
    console.error('Connection error details:', err);
});

// Add process error handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit the process, just log the error
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't exit the process, just log the error
});

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://celebrity-styles.onrender.com', 'https://celebrity-styles-frontend.onrender.com', 'https://celebrity-styles-backend.onrender.com']
        : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Health check route for Render
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is healthy!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Database status route
app.get('/api/db-status', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusText = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    
    res.json({
        success: true,
        database: statusText[dbStatus] || 'Unknown',
        readyState: dbStatus,
        host: mongoose.connection.host || 'Not connected',
        name: mongoose.connection.name || 'Not connected'
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/admin', require('./routes/admin'));
console.log('Loading before-after routes...');
app.use('/api/before-after', require('./routes/beforeAfter'));
console.log('Before-after routes loaded successfully');

// Serve frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Error stack:', err.stack);
    
    // Check if it's a database connection error
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
        return res.status(503).json({ 
            success: false, 
            message: 'Database connection error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Database unavailable'
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
}); 