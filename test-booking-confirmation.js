const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let adminToken = null;
let testBookingId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testAdminLogin() {
    console.log('🔐 Testing admin login...');
    try {
        const response = await makeRequest('POST', '/auth/login', {
            email: 'admin@celebritystyles.com',
            password: 'admin123'
        });

        if (response.status === 200 && response.data.success && response.data.token) {
            adminToken = response.data.token;
            console.log('✅ Admin login successful');
            return true;
        } else {
            console.log('❌ Admin login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Admin login error:', error.message);
        return false;
    }
}

async function createTestBooking() {
    console.log('📝 Creating test booking...');
    try {
        const response = await makeRequest('POST', '/bookings', {
            fullName: 'Test Customer',
            mobileNumber: '09123456789',
            email: 'test@example.com',
            service: 'manicure',
            selectedEmployee: 'Test Employee',
            appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            selectedTime: '10:00',
            clientNotes: 'Test booking for confirmation',
            totalAmount: 500
        });

        if (response.status === 201 && response.data.success && response.data.data._id) {
            testBookingId = response.data.data._id;
            console.log('✅ Test booking created with ID:', testBookingId);
            return true;
        } else {
            console.log('❌ Test booking creation failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Test booking creation error:', error.message);
        return false;
    }
}

async function testBookingConfirmation() {
    console.log('✅ Testing booking confirmation...');
    try {
        const response = await makeRequest('PUT', `/admin/bookings/${testBookingId}/status`, 
            { status: 'confirmed' },
            { 'Authorization': `Bearer ${adminToken}` }
        );

        if (response.status === 200 && response.data.success) {
            console.log('✅ Booking confirmation successful');
            console.log('📊 Updated booking data:', response.data.data);
            return true;
        } else {
            console.log('❌ Booking confirmation failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Booking confirmation error:', error.message);
        return false;
    }
}

async function verifyBookingStatus() {
    console.log('🔍 Verifying booking status...');
    try {
        const response = await makeRequest('GET', '/admin/bookings', null, {
            'Authorization': `Bearer ${adminToken}`
        });

        if (response.status === 200 && response.data.success) {
            const testBooking = response.data.data.find(booking => booking._id === testBookingId);
            if (testBooking) {
                console.log('✅ Test booking found in admin list');
                console.log('📊 Current status:', testBooking.status);
                return testBooking.status === 'confirmed';
            } else {
                console.log('❌ Test booking not found in admin list');
                return false;
            }
        } else {
            console.log('❌ Failed to fetch admin bookings:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Verification error:', error.message);
        return false;
    }
}

async function cleanupTestBooking() {
    console.log('🧹 Cleaning up test booking...');
    try {
        const response = await makeRequest('DELETE', `/admin/bookings/${testBookingId}`, null, {
            'Authorization': `Bearer ${adminToken}`
        });

        if (response.status === 200 && response.data.success) {
            console.log('✅ Test booking cleaned up successfully');
            return true;
        } else {
            console.log('❌ Test booking cleanup failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Cleanup error:', error.message);
        return false;
    }
}

// Main test execution
async function runTests() {
    console.log('🚀 Starting booking confirmation tests...\n');
    
    // Step 1: Admin login
    const loginSuccess = await testAdminLogin();
    if (!loginSuccess) {
        console.log('❌ Cannot proceed without admin login');
        return;
    }
    
    // Step 2: Create test booking
    const bookingCreated = await createTestBooking();
    if (!bookingCreated) {
        console.log('❌ Cannot proceed without test booking');
        return;
    }
    
    // Step 3: Test confirmation
    const confirmationSuccess = await testBookingConfirmation();
    if (!confirmationSuccess) {
        console.log('❌ Booking confirmation failed');
        return;
    }
    
    // Step 4: Verify status
    const statusVerified = await verifyBookingStatus();
    if (!statusVerified) {
        console.log('❌ Status verification failed');
        return;
    }
    
    // Step 5: Cleanup
    await cleanupTestBooking();
    
    console.log('\n🎉 All booking confirmation tests passed!');
    console.log('✅ The check icon should correctly confirm bookings, not delete them.');
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
}); 