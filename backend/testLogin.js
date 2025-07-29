const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

// Test login function
const testLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Test admin login
        const adminEmail = 'admin@celebritystyles.com';
        const adminPassword = 'admin123';

        console.log('\nTesting admin login...');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

        // Find user
        const user = await User.findOne({ email: adminEmail }).select('+password');
        
        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('✅ User found:', user.name);
        console.log('Role:', user.role);
        console.log('Is Active:', user.isActive);

        // Test password
        const isMatch = await user.comparePassword(adminPassword);
        console.log('Password match:', isMatch ? '✅' : '❌');

        if (isMatch) {
            console.log('✅ Login successful!');
        } else {
            console.log('❌ Login failed!');
        }

        // List all users
        console.log('\nAll users in database:');
        const allUsers = await User.find().select('-password');
        allUsers.forEach((u, index) => {
            console.log(`${index + 1}. ${u.name} (${u.email}) - ${u.role} - ${u.isActive ? 'Active' : 'Inactive'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the test
testLogin(); 