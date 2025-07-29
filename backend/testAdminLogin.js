const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './config.env' });

// Test admin login function
async function testAdminLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Test admin credentials
        const adminCredentials = [
            { email: 'admin@celebritystyles.com', password: 'admin123' },
            { email: 'manager@celebritystyles.com', password: 'manager123' }
        ];

        for (const cred of adminCredentials) {
            console.log(`\nTesting admin login for: ${cred.email}`);
            
            // Find user
            const user = await User.findOne({ email: cred.email }).select('+password');
            
            if (!user) {
                console.log(`❌ User not found: ${cred.email}`);
                continue;
            }

            console.log(`✅ User found: ${user.name} (${user.role})`);

            // Check if user is admin
            if (user.role !== 'admin') {
                console.log(`❌ User is not admin: ${user.role}`);
                continue;
            }

            console.log(`✅ User is admin`);

            // Test password
            const isMatch = await bcrypt.compare(cred.password, user.password);
            
            if (isMatch) {
                console.log(`✅ Password is correct`);
                console.log(`✅ Admin login successful for: ${cred.email}`);
            } else {
                console.log(`❌ Password is incorrect`);
            }
        }

        // List all admin users
        console.log('\n=== All Admin Users ===');
        const adminUsers = await User.find({ role: 'admin' }).select('-password');
        adminUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error testing admin login:', error);
        process.exit(1);
    }
}

// Run the test
testAdminLogin(); 