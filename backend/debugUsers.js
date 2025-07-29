const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

const debugUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find all users
        const users = await User.find({}).select('+password');
        console.log(`\nFound ${users.length} users in database:`);
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Has password: ${!!user.password}`);
            console.log(`   Password length: ${user.password ? user.password.length : 0}`);
            console.log(`   Password starts with $2b$: ${user.password ? user.password.startsWith('$2b$') : false}`);
        });

        // Test admin login specifically
        const adminUser = await User.findOne({ email: 'admin@celebritystyles.com' }).select('+password');
        if (adminUser) {
            console.log('\n=== ADMIN USER TEST ===');
            console.log('Admin user found:', adminUser.name);
            console.log('Password field exists:', !!adminUser.password);
            console.log('Password is hashed:', adminUser.password ? adminUser.password.startsWith('$2b$') : false);
            
            try {
                const isMatch = await adminUser.comparePassword('admin123');
                console.log('Password match test:', isMatch);
            } catch (error) {
                console.log('Password comparison error:', error.message);
            }
        } else {
            console.log('\n=== ADMIN USER NOT FOUND ===');
            console.log('No admin user found with email: admin@celebritystyles.com');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error debugging users:', error);
        process.exit(1);
    }
};

// Run the debug function
debugUsers(); 