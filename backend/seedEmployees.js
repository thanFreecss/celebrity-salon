const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Load environment variables
dotenv.config({ path: './config.env' });

// Real employee data extracted from the HTML table
const realEmployees = [
    {
        name: "Abregunda Aubrey",
        employeeId: "04",
        email: "aubrey.abregunda@celebritystyles.com",
        phone: "+63-917-000-0001",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel", "traditional-hamu", "glam-hamu", "airbrush-hamu", "classic-lashes", "cat-eye-lashes", "wispy-lashes", "volume-lashes"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "09:00",
            end: "18:00"
        },
        daysOff: ["Sunday"]
    },
    {
        name: "Batara Ghai",
        employeeId: "01",
        email: "ghai.batara@celebritystyles.com",
        phone: "+63-917-000-0002",
        specialties: [],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "09:00",
            end: "18:00"
        },
        daysOff: ["Monday"]
    },
    {
        name: "Dela roca Shee",
        employeeId: "08",
        email: "shee.delaroca@celebritystyles.com",
        phone: "+63-917-000-0003",
        specialties: ["traditional-hamu", "glam-hamu", "airbrush-hamu"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "10:00",
            end: "19:00"
        },
        daysOff: ["Tuesday"]
    },
    {
        name: "Diola Len",
        employeeId: "09",
        email: "len.diola@celebritystyles.com",
        phone: "+63-917-000-0004",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel", "traditional-hamu", "glam-hamu", "airbrush-hamu", "classic-lashes", "cat-eye-lashes", "wispy-lashes", "volume-lashes"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "08:00",
            end: "17:00"
        },
        daysOff: ["Wednesday"]
    },
    {
        name: "EMP TEST",
        employeeId: "011",
        email: "emp.test@celebritystyles.com",
        phone: "+63-917-000-0005",
        specialties: ["traditional-hamu", "glam-hamu", "airbrush-hamu"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "09:00",
            end: "18:00"
        },
        daysOff: ["Thursday"]
    },
    {
        name: "Flores Lyn",
        employeeId: "02",
        email: "lyn.flores@celebritystyles.com",
        phone: "+63-917-000-0006",
        specialties: ["traditional-hamu", "glam-hamu", "airbrush-hamu"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "10:00",
            end: "19:00"
        },
        daysOff: ["Friday"]
    },
    {
        name: "Flores Yumi",
        employeeId: "05",
        email: "yumi.flores@celebritystyles.com",
        phone: "+63-917-000-0007",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel", "traditional-hamu", "glam-hamu", "airbrush-hamu", "classic-lashes", "cat-eye-lashes", "wispy-lashes", "volume-lashes"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "09:00",
            end: "18:00"
        },
        daysOff: ["Saturday"]
    },
    {
        name: "Flores Kate Anne",
        employeeId: "06",
        email: "kateanne.flores@celebritystyles.com",
        phone: "+63-917-000-0008",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel", "traditional-hamu", "glam-hamu", "airbrush-hamu", "classic-lashes", "cat-eye-lashes", "wispy-lashes", "volume-lashes"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "08:00",
            end: "17:00"
        },
        daysOff: ["Sunday"]
    },
    {
        name: "Flores Joy",
        employeeId: "07",
        email: "joy.flores@celebritystyles.com",
        phone: "+63-917-000-0009",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel"],
        position: "Manicurist",
        isActive: true,
        workingHours: {
            start: "10:00",
            end: "19:00"
        },
        daysOff: ["Monday"]
    },
    {
        name: "Hermina Yssai",
        employeeId: "03",
        email: "yssai.hermina@celebritystyles.com",
        phone: "+63-917-000-0010",
        specialties: ["traditional-hamu", "glam-hamu", "airbrush-hamu"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "09:00",
            end: "18:00"
        },
        daysOff: ["Tuesday"]
    },
    {
        name: "Valdehueza Rio",
        employeeId: "010",
        email: "rio.valdehueza@celebritystyles.com",
        phone: "+63-917-000-0011",
        specialties: ["manicure", "pedicure", "manicure-gel", "manipedi-gel", "traditional-hamu", "glam-hamu", "airbrush-hamu", "classic-lashes", "cat-eye-lashes", "wispy-lashes", "volume-lashes"],
        position: "Hair Stylist",
        isActive: true,
        workingHours: {
            start: "08:00",
            end: "17:00"
        },
        daysOff: ["Wednesday"]
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

        // Clear existing employees
        await Employee.deleteMany({});
        console.log('Cleared existing employees');

        // Insert real employees
        const employees = await Employee.insertMany(realEmployees);
        console.log(`Successfully seeded ${employees.length} employees`);

        // Display the seeded employees
        console.log('\nSeeded Employees:');
        employees.forEach(emp => {
            console.log(`- ${emp.name} (${emp.employeeId}) - ${emp.position}`);
            if (emp.specialties.length > 0) {
                console.log(`  Specialties: ${emp.specialties.join(', ')}`);
            } else {
                console.log(`  Specialties: No services assigned`);
            }
        });

        console.log('\nDatabase seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedDatabase(); 