const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Test configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.onrender.com' 
    : 'http://localhost:5000';

const API_BASE = `${BASE_URL}/api`;

console.log('🧪 Starting comprehensive application test...');
console.log(`📍 Testing against: ${BASE_URL}`);
console.log('');

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '12345678901',
    password: 'testpassword123'
};

const testBooking = {
    fullName: 'Test Customer',
    mobileNumber: '12345678901',
    email: 'customer@example.com',
    service: 'Manicure',
    selectedEmployee: 'employee1',
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    selectedTime: '10:00 AM',
    clientNotes: 'Test booking notes'
};

let authToken = null;
let userId = null;
let bookingId = null;

// Utility functions
const logTest = (testName, status, details = '') => {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${testName}: ${status}${details ? ` - ${details}` : ''}`);
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(data && { data })
        };
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status 
        };
    }
};

// Test functions
const testDatabaseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logTest('Database Connection', 'PASS');
        return true;
    } catch (error) {
        logTest('Database Connection', 'FAIL', error.message);
        return false;
    }
};

const testServerHealth = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/health`);
        if (response.status === 200) {
            logTest('Server Health Check', 'PASS');
            return true;
        } else {
            logTest('Server Health Check', 'FAIL', `Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        logTest('Server Health Check', 'FAIL', error.message);
        return false;
    }
};

const testUserRegistration = async () => {
    const result = await makeRequest('POST', '/auth/register', testUser);
    
    if (result.success && result.data.success) {
        logTest('User Registration', 'PASS');
        return true;
    } else {
        logTest('User Registration', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testUserLogin = async () => {
    const loginData = {
        email: testUser.email,
        password: testUser.password
    };
    
    const result = await makeRequest('POST', '/auth/login', loginData);
    
    if (result.success && result.data.success && result.data.token) {
        authToken = result.data.token;
        userId = result.data.user._id;
        logTest('User Login', 'PASS');
        return true;
    } else {
        logTest('User Login', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testCreateBooking = async () => {
    const result = await makeRequest('POST', '/bookings', testBooking, authToken);
    
    if (result.success && result.data.success) {
        bookingId = result.data.booking._id;
        logTest('Create Booking', 'PASS');
        return true;
    } else {
        logTest('Create Booking', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testGetUserBookings = async () => {
    const result = await makeRequest('GET', '/bookings/user', null, authToken);
    
    if (result.success && result.data.success) {
        logTest('Get User Bookings', 'PASS');
        return true;
    } else {
        logTest('Get User Bookings', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testUpdateBooking = async () => {
    if (!bookingId) {
        logTest('Update Booking', 'SKIP', 'No booking ID available');
        return false;
    }
    
    const updateData = {
        status: 'confirmed'
    };
    
    const result = await makeRequest('PUT', `/bookings/${bookingId}`, updateData, authToken);
    
    if (result.success && result.data.success) {
        logTest('Update Booking', 'PASS');
        return true;
    } else {
        logTest('Update Booking', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testGetServices = async () => {
    const result = await makeRequest('GET', '/services');
    
    if (result.success && result.data.success) {
        logTest('Get Services', 'PASS');
        return true;
    } else {
        logTest('Get Services', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testGetEmployees = async () => {
    const result = await makeRequest('GET', '/employees');
    
    if (result.success && result.data.success) {
        logTest('Get Employees', 'PASS');
        return true;
    } else {
        logTest('Get Employees', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testUserProfile = async () => {
    const result = await makeRequest('GET', '/auth/me', null, authToken);
    
    if (result.success && result.data.success) {
        logTest('Get User Profile', 'PASS');
        return true;
    } else {
        logTest('Get User Profile', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testUpdateProfile = async () => {
    const updateData = {
        name: 'Updated Test User',
        phone: '98765432109'
    };
    
    const result = await makeRequest('PUT', '/users/profile', updateData, authToken);
    
    if (result.success && result.data.success) {
        logTest('Update User Profile', 'PASS');
        return true;
    } else {
        logTest('Update User Profile', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testCancelBooking = async () => {
    if (!bookingId) {
        logTest('Cancel Booking', 'SKIP', 'No booking ID available');
        return false;
    }
    
    const result = await makeRequest('PUT', `/bookings/${bookingId}/cancel`, null, authToken);
    
    if (result.success && result.data.success) {
        logTest('Cancel Booking', 'PASS');
        return true;
    } else {
        logTest('Cancel Booking', 'FAIL', result.error?.message || 'Unknown error');
        return false;
    }
};

const testValidationErrors = async () => {
    console.log('\n🔍 Testing validation errors...');
    
    // Test invalid email
    const invalidEmailResult = await makeRequest('POST', '/auth/register', {
        ...testUser,
        email: 'invalid-email'
    });
    
    if (!invalidEmailResult.success && invalidEmailResult.status === 400) {
        logTest('Email Validation', 'PASS');
    } else {
        logTest('Email Validation', 'FAIL', 'Should reject invalid email');
    }
    
    // Test past date booking
    const pastDateBooking = {
        ...testBooking,
        appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
    };
    
    const pastDateResult = await makeRequest('POST', '/bookings', pastDateBooking, authToken);
    
    if (!pastDateResult.success && pastDateResult.status === 400) {
        logTest('Past Date Validation', 'PASS');
    } else {
        logTest('Past Date Validation', 'FAIL', 'Should reject past dates');
    }
    
    // Test invalid phone number
    const invalidPhoneResult = await makeRequest('POST', '/auth/register', {
        ...testUser,
        phone: '123' // Too short
    });
    
    if (!invalidPhoneResult.success && invalidPhoneResult.status === 400) {
        logTest('Phone Validation', 'PASS');
    } else {
        logTest('Phone Validation', 'FAIL', 'Should reject invalid phone');
    }
};

const cleanupTestData = async () => {
    console.log('\n🧹 Cleaning up test data...');
    
    if (bookingId) {
        await makeRequest('DELETE', `/bookings/${bookingId}`, null, authToken);
    }
    
    if (userId) {
        await makeRequest('DELETE', `/users/${userId}`, null, authToken);
    }
    
    logTest('Test Data Cleanup', 'PASS');
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting application tests...\n');
    
    const tests = [
        { name: 'Database Connection', fn: testDatabaseConnection },
        { name: 'Server Health', fn: testServerHealth },
        { name: 'User Registration', fn: testUserRegistration },
        { name: 'User Login', fn: testUserLogin },
        { name: 'Create Booking', fn: testCreateBooking },
        { name: 'Get User Bookings', fn: testGetUserBookings },
        { name: 'Update Booking', fn: testUpdateBooking },
        { name: 'Get Services', fn: testGetServices },
        { name: 'Get Employees', fn: testGetEmployees },
        { name: 'Get User Profile', fn: testUserProfile },
        { name: 'Update User Profile', fn: testUpdateProfile },
        { name: 'Cancel Booking', fn: testCancelBooking }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passedTests++;
        } catch (error) {
            logTest(test.name, 'ERROR', error.message);
        }
    }
    
    // Run validation tests
    await testValidationErrors();
    
    // Cleanup
    await cleanupTestData();
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Your application is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔚 Test completed. Database connection closed.');
};

// Run tests
runTests().catch(error => {
    console.error('💥 Test runner error:', error);
    process.exit(1);
}); 