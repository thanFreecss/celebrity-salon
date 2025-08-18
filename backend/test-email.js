require('dotenv').config();
const { sendEmail, sendBookingConfirmation, sendBookingCancellation, sendBookingReschedule } = require('./utils/emailService');

async function testEmailService() {
    console.log('🧪 Testing Email Service...\n');
    
    // Test 1: Simple email
    console.log('1. Testing simple email...');
    try {
        const result = await sendEmail('test@example.com', {
            subject: '🧪 Test Email - Celebrity Styles Hair Salon',
            html: `
                <h1>Email Service Test</h1>
                <p>This is a test email to verify the email service is working correctly.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Status:</strong> ✅ Working</p>
            `
        });
        
        if (result.success) {
            console.log('✅ Simple email test passed');
        } else {
            console.log('❌ Simple email test failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Simple email test error:', error.message);
    }
    
    console.log('');
    
    // Test 2: Booking confirmation email
    console.log('2. Testing booking confirmation email...');
    try {
        const bookingData = {
            fullName: 'Test Customer',
            email: 'test@example.com',
            service: 'manicure',
            appointmentDate: new Date('2024-12-25'),
            selectedTime: '10:00',
            totalAmount: 150,
            stylistName: 'Test Stylist'
        };
        
        const result = await sendBookingConfirmation(bookingData);
        
        if (result.success) {
            console.log('✅ Booking confirmation email test passed');
        } else {
            console.log('❌ Booking confirmation email test failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Booking confirmation email test error:', error.message);
    }
    
    console.log('');
    
    // Test 3: Booking cancellation email
    console.log('3. Testing booking cancellation email...');
    try {
        const bookingData = {
            fullName: 'Test Customer',
            email: 'test@example.com',
            service: 'manicure',
            appointmentDate: new Date('2024-12-25'),
            selectedTime: '10:00'
        };
        
        const result = await sendBookingCancellation(bookingData);
        
        if (result.success) {
            console.log('✅ Booking cancellation email test passed');
        } else {
            console.log('❌ Booking cancellation email test failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Booking cancellation email test error:', error.message);
    }
    
    console.log('');
    
    // Test 4: Booking reschedule email
    console.log('4. Testing booking reschedule email...');
    try {
        const bookingData = {
            fullName: 'Test Customer',
            email: 'test@example.com',
            service: 'manicure',
            oldAppointmentDate: new Date('2024-12-25'),
            oldSelectedTime: '10:00',
            newAppointmentDate: new Date('2024-12-26'),
            newSelectedTime: '14:00',
            totalAmount: 150
        };
        
        const result = await sendBookingReschedule(bookingData);
        
        if (result.success) {
            console.log('✅ Booking reschedule email test passed');
        } else {
            console.log('❌ Booking reschedule email test failed:', result.error);
        }
    } catch (error) {
        console.log('❌ Booking reschedule email test error:', error.message);
    }
    
    console.log('\n🎉 Email service testing completed!');
    console.log('\n📧 Check the test email address for received emails.');
    console.log('📋 Review the console output above for any errors.');
}

// Check if environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email configuration missing!');
    console.log('Please set the following environment variables:');
    console.log('- EMAIL_USER (should be cstyleshairsalon@gmail.com)');
    console.log('- EMAIL_PASSWORD (your Gmail app password)');
    console.log('\n📖 See EMAIL_SETUP_GUIDE.md for detailed instructions.');
    process.exit(1);
}

// Run the test
testEmailService().catch(console.error);
