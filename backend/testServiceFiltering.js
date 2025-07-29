const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Load environment variables
dotenv.config({ path: './config.env' });

const testServiceFiltering = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Test different services
        const testServices = [
            'manicure',
            'pedicure', 
            'traditional-hamu',
            'glam-hamu',
            'classic-lashes',
            'foot-massage',
            'nonexistent-service'
        ];

        console.log('\n=== TESTING SERVICE-BASED EMPLOYEE FILTERING ===\n');

        for (const service of testServices) {
            console.log(`\n--- Testing service: "${service}" ---`);
            
            try {
                // Find employees for this service
                const employees = await Employee.find({
                    isActive: true,
                    specialties: service
                });

                console.log(`Found ${employees.length} employees for "${service}":`);
                
                if (employees.length > 0) {
                    employees.forEach((emp, index) => {
                        console.log(`  ${index + 1}. ${emp.name} (${emp.position})`);
                        console.log(`     Specialties: ${emp.specialties.join(', ')}`);
                    });
                } else {
                    console.log('  No employees found for this service');
                }
            } catch (error) {
                console.error(`Error testing service "${service}":`, error.message);
            }
        }

        // Show all employees and their specialties
        console.log('\n=== ALL EMPLOYEES AND THEIR SPECIALTIES ===\n');
        const allEmployees = await Employee.find({ isActive: true });
        
        allEmployees.forEach((emp, index) => {
            console.log(`${index + 1}. ${emp.name} (${emp.position})`);
            console.log(`   Specialties: ${emp.specialties.length > 0 ? emp.specialties.join(', ') : 'No specialties assigned'}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error testing service filtering:', error);
        process.exit(1);
    }
};

// Run the test
testServiceFiltering(); 