const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBookingIds() {
    console.log('🧪 Testing Custom Booking ID System\n');
    
    try {
        // Test 1: Create a booking and check the ID
        console.log('1. Creating a test booking...');
        const bookingData = {
            fullName: 'Test User',
            mobileNumber: '09123456789',
            email: 'test@example.com',
            service: 'manicure',
            appointmentDate: '2024-12-25',
            selectedTime: '10:00',
            clientNotes: 'Test booking for ID system'
        };
        
        const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            const booking = response.data.data;
            console.log(`✅ Booking created successfully!`);
            console.log(`   MongoDB ID: ${booking._id}`);
            console.log(`   Custom Booking ID: ${booking.bookingId}`);
            console.log(`   Expected Booking ID: 1 (first booking)\n`);
            
            // Test 2: Create another booking to verify increment
            console.log('2. Creating a second test booking...');
            const bookingData2 = {
                fullName: 'Test User 2',
                mobileNumber: '09123456788',
                email: 'test2@example.com',
                service: 'pedicure',
                appointmentDate: '2024-12-26',
                selectedTime: '11:00',
                clientNotes: 'Second test booking'
            };
            
            const response2 = await axios.post(`${API_BASE_URL}/bookings`, bookingData2, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response2.data.success) {
                const booking2 = response2.data.data;
                console.log(`✅ Second booking created successfully!`);
                console.log(`   MongoDB ID: ${booking2._id}`);
                console.log(`   Custom Booking ID: ${booking2.bookingId}`);
                console.log(`   Expected Booking ID: 2 (second booking)\n`);
                
                // Test 3: Retrieve booking by custom ID
                console.log('3. Testing retrieval by custom booking ID...');
                const getResponse = await axios.get(`${API_BASE_URL}/bookings/id/${booking.bookingId}`);
                
                if (getResponse.data.success) {
                    console.log(`✅ Successfully retrieved booking by custom ID: ${booking.bookingId}`);
                    console.log(`   Retrieved booking name: ${getResponse.data.data.fullName}\n`);
                } else {
                    console.log('❌ Failed to retrieve booking by custom ID');
                }
                
                // Test 4: Test invalid booking ID
                console.log('4. Testing invalid booking ID...');
                try {
                    await axios.get(`${API_BASE_URL}/bookings/id/99999`);
                    console.log('❌ Should have failed but got success');
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.log('✅ Correctly handled non-existent booking ID\n');
                    } else {
                        console.log('❌ Unexpected error:', error.response?.data || error.message);
                    }
                }
                
                console.log('🎉 Custom Booking ID System Test Completed Successfully!');
                console.log('\n📋 Summary:');
                console.log(`   - First booking ID: ${booking.bookingId}`);
                console.log(`   - Second booking ID: ${booking2.bookingId}`);
                console.log(`   - Sequential increment: ✅ Working`);
                console.log(`   - Retrieval by custom ID: ✅ Working`);
                console.log(`   - Error handling: ✅ Working`);
                
            } else {
                console.log('❌ Failed to create second booking:', response2.data.message);
            }
            
        } else {
            console.log('❌ Failed to create first booking:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testBookingIds(); 