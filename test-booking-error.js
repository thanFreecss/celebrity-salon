const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBookingCreation() {
    try {
        console.log('Testing booking creation...');
        
        const bookingData = {
            fullName: 'Test User',
            mobileNumber: '09123456789',
            email: 'test@example.com',
            service: 'manicure',
            selectedEmployee: 'Test Employee',
            appointmentDate: '2025-01-15',
            selectedTime: '10:00',
            clientNotes: 'Test booking'
        };
        
        console.log('Sending booking data:', bookingData);
        
        const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Success! Response:', response.data);
        
    } catch (error) {
        console.error('Error creating booking:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Error Message:', error.message);
        
        if (error.response?.data?.message) {
            console.error('Server Error Message:', error.response.data.message);
        }
    }
}

testBookingCreation(); 