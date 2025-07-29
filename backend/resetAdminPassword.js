const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

const resetAdminPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find the admin user
        const adminUser = await User.findOne({ email: 'admin@celebritystyles.com' });
        
        if (!adminUser) {
            console.log('Admin user not found. Creating new admin user...');
            
            // Create new admin user with plain password (will be hashed by middleware)
            const newAdmin = new User({
                name: 'Super Administrator',
                email: 'admin@celebritystyles.com',
                phone: '09171386028',
                password: 'admin123',
                role: 'admin',
                isActive: true
            });
            
            await newAdmin.save();
            console.log('New admin user created successfully!');
        } else {
            console.log('Admin user found. Resetting password...');
            
            // Reset password using updateOne to bypass pre-save middleware
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await User.updateOne(
                { _id: adminUser._id },
                { password: hashedPassword }
            );
            console.log('Admin password reset successfully!');
        }

        // Verify the password works
        const testUser = await User.findOne({ email: 'admin@celebritystyles.com' }).select('+password');
        const isMatch = await testUser.comparePassword('admin123');
        console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');

        console.log('\nAdmin Login Credentials:');
        console.log('Email: admin@celebritystyles.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin password:', error);
        process.exit(1);
    }
};

// Run the reset function
resetAdminPassword(); 