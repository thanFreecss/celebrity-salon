const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

// Fix admin passwords
const fixAdminPasswords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Update admin passwords
        const adminUpdates = [
            {
                email: 'admin@celebritystyles.com',
                password: 'admin123'
            },
            {
                email: 'manager@celebritystyles.com',
                password: 'manager123'
            }
        ];

        for (const update of adminUpdates) {
            console.log(`\nUpdating password for ${update.email}...`);
            
            const user = await User.findOne({ email: update.email });
            if (user) {
                // Set the new password (this will trigger the pre-save hook to hash it)
                user.password = update.password;
                await user.save();
                console.log(`✅ Password updated for ${update.email}`);
            } else {
                console.log(`❌ User not found: ${update.email}`);
            }
        }

        // Test the login
        console.log('\nTesting admin login...');
        const testUser = await User.findOne({ email: 'admin@celebritystyles.com' }).select('+password');
        const isMatch = await testUser.comparePassword('admin123');
        console.log('Password test result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

        console.log('\n✅ Admin passwords fixed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Run the fix
fixAdminPasswords(); 