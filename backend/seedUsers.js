const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

// Admin and user data
const users = [
    {
        name: "Super Administrator",
        email: "admin@celebritystyles.com",
        phone: "09171386028",
        password: "admin123",
        role: "admin",
        isActive: true
    },
    {
        name: "Salon Manager",
        email: "manager@celebritystyles.com",
        phone: "09171386029",
        password: "manager123",
        role: "admin",
        isActive: true
    },
    {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "09123456789",
        password: "password123",
        role: "user",
        isActive: true
    },
    {
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "09187654321",
        password: "password123",
        role: "user",
        isActive: true
    },
    {
        name: "Maria Garcia",
        email: "maria.garcia@email.com",
        phone: "09111222333",
        password: "password123",
        role: "user",
        isActive: false
    }
];

// Connect to database and seed data
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Insert users
        const createdUsers = await User.insertMany(users);
        console.log(`Successfully seeded ${createdUsers.length} users`);

        // Display the seeded users
        console.log('\nSeeded Users:');
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role}`);
            console.log(`  Phone: ${user.phone}`);
            console.log(`  Status: ${user.isActive ? 'Active' : 'Inactive'}`);
        });

        console.log('\nDatabase seeding completed successfully!');
        console.log('\nAdmin Login Credentials:');
        console.log('Email: admin@celebritystyles.com');
        console.log('Password: admin123');
        console.log('\nManager Login Credentials:');
        console.log('Email: manager@celebritystyles.com');
        console.log('Password: manager123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedDatabase(); 