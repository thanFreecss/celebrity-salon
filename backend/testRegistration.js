const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

const testRegistration = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check current users
        const currentUsers = await User.find({});
        console.log(`\nCurrent users in database: ${currentUsers.length}`);
        currentUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
        });

        // Test creating a new user
        console.log('\n=== TESTING USER CREATION ===');
        const testUserData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '09123456789',
            password: 'password123',
            role: 'user',
            isActive: true
        };

        // Check if test user already exists
        const existingUser = await User.findOne({ email: testUserData.email });
        if (existingUser) {
            console.log('Test user already exists, deleting...');
            await User.findByIdAndDelete(existingUser._id);
        }

        // Create new test user
        const newUser = new User(testUserData);
        await newUser.save();
        console.log('Test user created successfully!');

        // Check users again
        const updatedUsers = await User.find({});
        console.log(`\nUsers after creation: ${updatedUsers.length}`);
        updatedUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
        });

        // Test the admin users endpoint
        console.log('\n=== TESTING ADMIN USERS ENDPOINT ===');
        const adminUsers = await User.find({}).select('-password');
        console.log(`Admin endpoint would return: ${adminUsers.length} users`);
        adminUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
        });

        // Clean up test user
        await User.findOneAndDelete({ email: testUserData.email });
        console.log('\nTest user cleaned up');

        process.exit(0);
    } catch (error) {
        console.error('Error testing registration:', error);
        process.exit(1);
    }
};

// Run the test
testRegistration(); 