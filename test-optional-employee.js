// Test script to verify optional employee selection in booking form
const API_BASE_URL = 'http://localhost:5000/api';

async function testOptionalEmployeeBooking() {
    console.log('Testing optional employee booking...');
    
    const testBookingData = {
        fullName: 'Test User',
        mobileNumber: '09171234567',
        email: 'test@example.com',
        service: 'manicure',
        selectedEmployee: '', // Empty employee selection
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        selectedTime: '10:00',
        clientNotes: 'Test booking without employee selection'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBookingData)
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            console.log('✅ Test PASSED: Booking created successfully without employee selection');
            console.log('Booking ID:', result.data.bookingId);
            console.log('Employee field:', result.data.selectedEmployee);
        } else {
            console.log('❌ Test FAILED:', result.message);
        }
    } catch (error) {
        console.error('❌ Test ERROR:', error.message);
    }
}

async function testWithEmployeeSelection() {
    console.log('\nTesting booking with employee selection...');
    
    const testBookingData = {
        fullName: 'Test User 2',
        mobileNumber: '09171234568',
        email: 'test2@example.com',
        service: 'pedicure',
        selectedEmployee: 'John Doe', // With employee selection
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
        selectedTime: '14:00',
        clientNotes: 'Test booking with employee selection'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBookingData)
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            console.log('✅ Test PASSED: Booking created successfully with employee selection');
            console.log('Booking ID:', result.data.bookingId);
            console.log('Employee field:', result.data.selectedEmployee);
        } else {
            console.log('❌ Test FAILED:', result.message);
        }
    } catch (error) {
        console.error('❌ Test ERROR:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🧪 Starting optional employee booking tests...\n');
    
    await testOptionalEmployeeBooking();
    await testWithEmployeeSelection();
    
    console.log('\n🏁 Tests completed!');
}

// Run the tests if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runTests();
} else {
    // Browser environment
    runTests();
} 