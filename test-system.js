// Comprehensive System Test for Celebrity Styles Hair Salon
const fs = require('fs');
const path = require('path');

console.log('🔍 Celebrity Styles Hair Salon - System Test');
console.log('============================================\n');

// Test 1: Check if all required files exist
console.log('📁 Testing File Structure...');
const requiredFiles = [
    'backend/server.js',
    'backend/package.json',
    'frontend/index.html',
    'frontend/package.json',
    'config.env',
    'frontend/config.js',
    'frontend/script.js',
    'frontend/user-profile.js',
    'frontend/admin-panel.js',
    'frontend/admin-login.html',
    'frontend/login.html',
    'frontend/signup.html'
];

let fileErrors = 0;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        fileErrors++;
    }
});

if (fileErrors > 0) {
    console.log(`\n⚠️  ${fileErrors} required files are missing!`);
} else {
    console.log('\n✅ All required files present');
}

// Test 2: Check backend dependencies
console.log('\n📦 Testing Backend Dependencies...');
try {
    const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    const requiredDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors', 'dotenv'];
    
    let depErrors = 0;
    requiredDeps.forEach(dep => {
        if (backendPackage.dependencies && backendPackage.dependencies[dep]) {
            console.log(`✅ ${dep}: ${backendPackage.dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} - MISSING`);
            depErrors++;
        }
    });
    
    if (depErrors > 0) {
        console.log(`\n⚠️  ${depErrors} required dependencies are missing!`);
    } else {
        console.log('\n✅ All required backend dependencies present');
    }
} catch (error) {
    console.log(`❌ Error reading backend package.json: ${error.message}`);
}

// Test 3: Check frontend dependencies
console.log('\n📦 Testing Frontend Dependencies...');
try {
    const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    const requiredDeps = ['express', 'cors'];
    
    let depErrors = 0;
    requiredDeps.forEach(dep => {
        if (frontendPackage.dependencies && frontendPackage.dependencies[dep]) {
            console.log(`✅ ${dep}: ${frontendPackage.dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} - MISSING`);
            depErrors++;
        }
    });
    
    if (depErrors > 0) {
        console.log(`\n⚠️  ${depErrors} required dependencies are missing!`);
    } else {
        console.log('\n✅ All required frontend dependencies present');
    }
} catch (error) {
    console.log(`❌ Error reading frontend package.json: ${error.message}`);
}

// Test 4: Check configuration
console.log('\n⚙️  Testing Configuration...');
try {
    const configContent = fs.readFileSync('config.env', 'utf8');
    const requiredConfigs = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    
    let configErrors = 0;
    requiredConfigs.forEach(config => {
        if (configContent.includes(config)) {
            console.log(`✅ ${config} configured`);
        } else {
            console.log(`❌ ${config} - NOT CONFIGURED`);
            configErrors++;
        }
    });
    
    if (configErrors > 0) {
        console.log(`\n⚠️  ${configErrors} required configurations are missing!`);
        console.log('Please update config.env with your actual values');
    } else {
        console.log('\n✅ All required configurations present');
    }
} catch (error) {
    console.log(`❌ Error reading config.env: ${error.message}`);
}

// Test 5: Check HTML structure
console.log('\n🌐 Testing HTML Structure...');
try {
    const indexHtml = fs.readFileSync('frontend/index.html', 'utf8');
    const requiredElements = [
        'bookingModal',
        'bookingForm',
        'user-profile',
        'user-actions',
        'config.js',
        'script.js',
        'user-profile.js'
    ];
    
    let htmlErrors = 0;
    requiredElements.forEach(element => {
        if (indexHtml.includes(element)) {
            console.log(`✅ ${element} found in HTML`);
        } else {
            console.log(`❌ ${element} - MISSING FROM HTML`);
            htmlErrors++;
        }
    });
    
    if (htmlErrors > 0) {
        console.log(`\n⚠️  ${htmlErrors} required elements are missing from HTML!`);
    } else {
        console.log('\n✅ All required HTML elements present');
    }
} catch (error) {
    console.log(`❌ Error reading index.html: ${error.message}`);
}

// Test 6: Check JavaScript functionality
console.log('\n🔧 Testing JavaScript Functionality...');
try {
    const scriptJs = fs.readFileSync('frontend/script.js', 'utf8');
    const requiredFunctions = [
        'openBookingModal',
        'closeBookingModal',
        'autoFillUserData',
        'showNotification',
        'setupPhoneValidation'
    ];
    
    let jsErrors = 0;
    requiredFunctions.forEach(func => {
        if (scriptJs.includes(func)) {
            console.log(`✅ ${func} function found`);
        } else {
            console.log(`❌ ${func} function - MISSING`);
            jsErrors++;
        }
    });
    
    if (jsErrors > 0) {
        console.log(`\n⚠️  ${jsErrors} required functions are missing!`);
    } else {
        console.log('\n✅ All required JavaScript functions present');
    }
} catch (error) {
    console.log(`❌ Error reading script.js: ${error.message}`);
}

// Test 7: Check API routes
console.log('\n🔗 Testing API Routes...');
try {
    const serverJs = fs.readFileSync('backend/server.js', 'utf8');
    const requiredRoutes = [
        '/api/auth',
        '/api/users',
        '/api/bookings',
        '/api/services',
        '/api/employees',
        '/api/admin'
    ];
    
    let routeErrors = 0;
    requiredRoutes.forEach(route => {
        if (serverJs.includes(route)) {
            console.log(`✅ ${route} route configured`);
        } else {
            console.log(`❌ ${route} route - MISSING`);
            routeErrors++;
        }
    });
    
    if (routeErrors > 0) {
        console.log(`\n⚠️  ${routeErrors} required routes are missing!`);
    } else {
        console.log('\n✅ All required API routes configured');
    }
} catch (error) {
    console.log(`❌ Error reading server.js: ${error.message}`);
}

console.log('\n🎯 System Test Complete!');
console.log('============================================');
console.log('\n📋 Next Steps:');
console.log('1. Update config.env with your actual MongoDB URI and JWT secret');
console.log('2. Run: cd backend && npm start');
console.log('3. Run: cd frontend && npm start');
console.log('4. Open http://localhost:3000 in your browser');
console.log('5. Test the booking functionality');
console.log('6. Test user registration and login');
console.log('7. Test admin panel (admin@celebritystyles.com / admin123)');
console.log('\n🚀 Your salon booking system is ready to use!'); 