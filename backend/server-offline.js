const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './config.env' });

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'http://127.0.0.1:3000'],
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
        message: 'Offline server is running!',
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Offline server is healthy!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'Offline Mode'
    });
});

// Database status route
app.get('/api/db-status', (req, res) => {
    res.json({
        success: true,
        database: 'Offline Mode',
        readyState: 1,
        host: 'localhost',
        name: 'offline'
    });
});

// Mock forgot password endpoint
app.post('/api/auth/forgotpassword', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }
    
    // Generate a mock reset token
    const resetToken = 'mock-reset-token-' + Date.now();
    const resetUrl = `http://localhost:5000/frontend/reset-password.html?token=${resetToken}`;
    
    console.log('Mock password reset for email:', email);
    console.log('Mock reset URL:', resetUrl);
    
    res.json({
        success: true,
        message: 'Password reset link generated successfully (Offline Mode). Check console for reset URL.',
        debug: {
            resetUrl: resetUrl,
            token: resetToken,
            email: email
        }
    });
});

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    // Mock successful login
    res.json({
        success: true,
        data: {
            _id: 'mock-user-id',
            name: 'Mock User',
            email: email,
            role: 'user',
            token: 'mock-jwt-token-' + Date.now()
        }
    });
});

// Mock register endpoint
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // Mock successful registration
    res.status(201).json({
        success: true,
        data: {
            _id: 'mock-user-id-' + Date.now(),
            name: name,
            email: email,
            phone: phone,
            role: 'user',
            token: 'mock-jwt-token-' + Date.now()
        }
    });
});

// Serve frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Offline server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log('Note: This is an offline mode server for testing purposes');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
}); 