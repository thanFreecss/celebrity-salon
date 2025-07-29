const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    console.log('=== AUTH MIDDLEWARE STARTED ===');
    console.log('Request URL:', req.url);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token ? 'Present' : 'Missing');

            // Check if JWT_SECRET exists
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined');
                return res.status(500).json({ 
                    success: false, 
                    message: 'Server configuration error' 
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully, user ID:', decoded.id);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            console.log('User found:', req.user ? 'Yes' : 'No');

            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Not authorized, user not found' 
                });
            }

            console.log('=== AUTH MIDDLEWARE SUCCESS ===');
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            console.error('Error stack:', error.stack);
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed: ' + error.message 
            });
        }
    } else {
        console.log('No authorization header found');
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token' 
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Not authorized as admin' 
        });
    }
};

module.exports = { protect, admin }; 