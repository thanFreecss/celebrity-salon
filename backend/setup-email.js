const fs = require('fs');
const path = require('path');

console.log('🔧 Email Configuration Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('✅ .env file already exists');
    
    // Read existing .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if email configuration is already set
    if (envContent.includes('EMAIL_USER=') && envContent.includes('EMAIL_PASSWORD=')) {
        console.log('✅ Email configuration already exists in .env file');
        console.log('\n📧 Current email configuration:');
        
        const lines = envContent.split('\n');
        lines.forEach(line => {
            if (line.startsWith('EMAIL_USER=') || line.startsWith('EMAIL_PASSWORD=')) {
                if (line.startsWith('EMAIL_PASSWORD=')) {
                    const password = line.split('=')[1];
                    const maskedPassword = password.length > 4 ? 
                        password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2) :
                        '*'.repeat(password.length);
                    console.log(`   ${line.split('=')[0]}=${maskedPassword}`);
                } else {
                    console.log(`   ${line}`);
                }
            }
        });
    } else {
        console.log('❌ Email configuration missing from .env file');
        console.log('\n📝 Please add the following lines to your .env file:');
        console.log('EMAIL_USER=cstyleshairsalon@gmail.com');
        console.log('EMAIL_PASSWORD=your_app_password_here');
    }
} else {
    console.log('❌ .env file not found');
    console.log('\n📝 Please create a .env file in the backend directory with the following content:');
    console.log('');
    console.log('# Database Configuration');
    console.log('MONGODB_URI=your_mongodb_connection_string');
    console.log('');
    console.log('# JWT Configuration');
    console.log('JWT_SECRET=your_jwt_secret_key_here');
    console.log('JWT_EXPIRE=7d');
    console.log('');
    console.log('# Server Configuration');
    console.log('PORT=5000');
    console.log('NODE_ENV=development');
    console.log('');
    console.log('# CORS Configuration');
    console.log('FRONTEND_URL=https://celebrity-styles-frontend.onrender.com');
    console.log('BACKEND_URL=https://celebrity-styles-backend.onrender.com');
    console.log('');
    console.log('# Email Configuration');
    console.log('EMAIL_USER=cstyleshairsalon@gmail.com');
    console.log('EMAIL_PASSWORD=your_app_password_here');
}

console.log('\n🔑 Important Notes:');
console.log('1. Make sure you use the correct email: cstyleshairsalon@gmail.com');
console.log('2. Use the Gmail app password, not your regular Gmail password');
console.log('3. If you haven\'t generated an app password yet, follow the EMAIL_SETUP_GUIDE.md');
console.log('4. The password you provided should be used as EMAIL_PASSWORD');

console.log('\n🧪 To test the email configuration, run:');
console.log('npm run test-email');

console.log('\n📖 For detailed setup instructions, see: EMAIL_SETUP_GUIDE.md');
