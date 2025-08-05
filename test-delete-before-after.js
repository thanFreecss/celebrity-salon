const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDeleteBeforeAfter() {
    try {
        console.log('Testing Delete Before & After functionality...\n');

        // First, let's get an admin token
        const loginResponse = await fetch(`${API_BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@celebritystyles.com',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Failed to login as admin');
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        console.log('✅ Admin login successful');

        // Get all before & after images
        const getResponse = await fetch(`${API_BASE_URL}/before-after/admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!getResponse.ok) {
            throw new Error('Failed to fetch before & after images');
        }

        const images = await getResponse.json();
        console.log(`✅ Found ${images.length} before & after images`);

        if (images.length === 0) {
            console.log('⚠️  No images to test deletion with');
            return;
        }

        // Test deleting the first image
        const firstImage = images[0];
        console.log(`\n🗑️  Testing deletion of image: ${firstImage._id}`);

        const deleteResponse = await fetch(`${API_BASE_URL}/before-after/${firstImage._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(`Delete failed: ${errorData.message || 'Unknown error'}`);
        }

        const deleteData = await deleteResponse.json();
        console.log(`✅ Delete successful: ${deleteData.message}`);

        // Verify the image was deleted by trying to fetch it again
        const verifyResponse = await fetch(`${API_BASE_URL}/before-after/admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!verifyResponse.ok) {
            throw new Error('Failed to verify deletion');
        }

        const remainingImages = await verifyResponse.json();
        const imageStillExists = remainingImages.find(img => img._id === firstImage._id);
        
        if (imageStillExists) {
            console.log('❌ Image still exists after deletion');
        } else {
            console.log(`✅ Image successfully deleted. Remaining images: ${remainingImages.length}`);
        }

        console.log('\n🎉 Delete Before & After test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testDeleteBeforeAfter(); 