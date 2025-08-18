# Quick Email Setup Guide

## 🚀 Quick Setup Steps

### Step 1: Create .env file
Create a file named `.env` in the `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=https://celebrity-styles-frontend.onrender.com
BACKEND_URL=https://celebrity-styles-backend.onrender.com

# Email Configuration
EMAIL_USER=cstyleshairsalon@gmail.com
EMAIL_PASSWORD=your_provided_password_here
```

### Step 2: Replace the password
Replace `your_provided_password_here` with the password you provided.

### Step 3: Test the configuration
Run the following command in the backend directory:

```bash
npm run setup-email
```

This will check your configuration and show you the current status.

### Step 4: Test email sending
Run the email test:

```bash
npm run test-email
```

## 📧 Email Configuration Details

- **Email Address**: `cstyleshairsalon@gmail.com`
- **Password**: Use the password you provided
- **Location**: Bauan, Batangas

## 🔧 Important Notes

1. **Email Address**: Make sure you use `cstyleshairsalon@gmail.com` (not `info@celebritystyleshairsalon@gmail.com`)

2. **Password Type**: 
   - If you're using a regular Gmail password, you'll need to enable 2-factor authentication and generate an app password
   - If you already have an app password, use that instead

3. **Gmail App Password Setup** (if needed):
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use that 16-character password as EMAIL_PASSWORD

## 🧪 Testing

After setup, test the email system:

1. **Run setup check**: `npm run setup-email`
2. **Test email sending**: `npm run test-email`
3. **Create a test booking** through the frontend
4. **Check if confirmation email is received**

## 📞 If You Need Help

1. Check the detailed `EMAIL_SETUP_GUIDE.md` for comprehensive instructions
2. Run `npm run setup-email` to diagnose configuration issues
3. Check server logs for error messages

---

**Status**: Ready for configuration with your provided password
**Email**: cstyleshairsalon@gmail.com
**Location**: Bauan, Batangas
