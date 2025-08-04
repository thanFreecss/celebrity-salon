const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugRegistration() {
    console.log('🔍 Debugging Registration Issues\n');
    
    // Test data - replace with your actual data
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '09123456789', // Make sure this is exactly 11 digits
        password: 'password123'
    };
    
    console.log('📤 Sending registration data:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Registration successful!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Registration failed!');
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        
        if (error.response?.data) {
            console.log('\n📋 Error Details:');
            console.log(JSON.stringify(error.response.data, null, 2));
            
            // Check for validation errors
            if (error.response.data.errors) {
                console.log('\n🔍 Validation Errors:');
                error.response.data.errors.forEach((err, index) => {
                    console.log(`${index + 1}. Field: ${err.path}`);
                    console.log(`   Value: ${err.value}`);
                    console.log(`   Message: ${err.msg}`);
                    console.log('');
                });
            }
        }
        
        console.log('\n💡 Common Issues:');
        console.log('1. Phone number must be exactly 11 digits (e.g., 09123456789)');
        console.log('2. Email must be a valid email format');
        console.log('3. Password must be at least 6 characters');
        console.log('4. Name must be at least 2 characters');
        console.log('5. User with this email might already exist');
    }
}

// Run the debug
debugRegistration(); 