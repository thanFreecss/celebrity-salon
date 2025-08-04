const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPasswordReset() {
    console.log('🧪 Testing Password Reset Functionality\n');
    
    try {
        // Test 1: Request password reset for non-existent user
        console.log('1. Testing password reset for non-existent user...');
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, {
                email: 'nonexistent@example.com'
            });
            console.log('❌ Should have failed but got:', response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Correctly rejected non-existent user');
            } else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        
        // Test 2: Request password reset for valid user (you'll need to replace with a real email)
        console.log('\n2. Testing password reset for valid user...');
        console.log('⚠️  Replace "test@example.com" with a real email address in your database');
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, {
                email: 'test@example.com' // Replace with real email
            });
            console.log('✅ Password reset request successful:', response.data);
        } catch (error) {
            console.log('❌ Password reset request failed:', error.response?.data || error.message);
        }
        
        // Test 3: Test invalid reset token
        console.log('\n3. Testing invalid reset token...');
        try {
            const response = await axios.put(`${API_BASE_URL}/auth/resetpassword/invalid-token`, {
                password: 'newpassword123'
            });
            console.log('❌ Should have failed but got:', response.data);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Correctly rejected invalid token');
            } else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        
        console.log('\n🎉 Password reset functionality tests completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Update EMAIL_USER and EMAIL_PASSWORD in config.env with real Gmail credentials');
        console.log('2. Replace "test@example.com" with a real email address from your database');
        console.log('3. Test the complete flow by requesting a password reset');
        console.log('4. Check your email for the reset link');
        console.log('5. Use the reset link to set a new password');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testPasswordReset(); 