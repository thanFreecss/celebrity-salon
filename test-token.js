const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './backend/config.env' });

// The token you provided
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODdjZTY3ODYyMmRiODA4YjMwMmEyMyIsImlhdCI6MTc1MzgwODczOSwiZXhwIjoxNzUzODk1MTM5fQ.v3x9B2BbB_DSefbbQ5sCzQZz-tcAg6uqVqw12gtYtHA';

try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token is valid!');
    console.log('Decoded token:', decoded);
    console.log('User ID:', decoded.id);
    console.log('Issued at:', new Date(decoded.iat * 1000));
    console.log('Expires at:', new Date(decoded.exp * 1000));
    console.log('Current time:', new Date());
    console.log('Token expired:', Date.now() > decoded.exp * 1000);
} catch (error) {
    console.error('Token verification failed:', error.message);
}

// Test the API endpoint
const fetch = require('node-fetch');

async function testAPI() {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('\nAPI Test Results:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', data);
        } else {
            const errorText = await response.text();
            console.log('Error Response:', errorText);
        }
    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

testAPI(); 