# Email Notification Setup Guide

## Overview
The Celebrity Styles Hair Salon booking system now includes comprehensive email notifications for:
- ✅ Booking confirmations
- 🔄 Booking reschedules  
- ❌ Booking cancellations
- 🔐 Password reset requests

## Gmail Configuration

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click on "App passwords" at the bottom
4. Select "Mail" as the app and "Other" as the device
5. Enter "Celebrity Styles Salon" as the name
6. Click "Generate"
7. **Copy the 16-character password** (you'll only see it once!)

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` directory with the following content:

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
EMAIL_PASSWORD=your_16_character_app_password_here
```

**Important:** Replace `your_16_character_app_password_here` with the app password generated in Step 2.

## Email Templates

The system includes professionally designed email templates:

### 1. Booking Confirmation Email
- ✅ Confirms new bookings
- 📍 Includes salon location with QR code
- 📞 Contact information
- 💡 Pre-appointment reminders
- 🎨 Beautiful, branded design

### 2. Booking Reschedule Email
- 🔄 Notifies when appointments are rescheduled
- 📅 Shows old and new appointment details
- ⏳ Status updates for pending approvals
- 📞 Contact information for questions

### 3. Booking Cancellation Email
- ❌ Notifies when appointments are cancelled
- 📅 Shows cancelled appointment details
- 📞 Contact information for rebooking
- 💝 Professional, empathetic tone

### 4. Password Reset Email
- 🔐 Secure password reset functionality
- ⏰ Time-limited reset links
- 🔒 Security warnings and instructions

## Testing Email Functionality

### Test Booking Creation
1. Create a new booking through the frontend
2. Check the client's email for confirmation
3. Verify all details are correct

### Test Admin Status Updates
1. Log in to admin panel
2. Change booking status to "confirmed"
3. Check client's email for confirmation
4. Test cancellation and reschedule notifications

### Test User Reschedule
1. Log in as a user
2. Reschedule an existing booking
3. Check email for reschedule notification

## Troubleshooting

### Common Issues

**1. "Invalid login" error**
- Verify the app password is correct
- Ensure 2-factor authentication is enabled
- Check that EMAIL_USER is set to cstyleshairsalon@gmail.com

**2. Emails not sending**
- Check server logs for error messages
- Verify all environment variables are set
- Test email service connection

**3. Emails going to spam**
- Add cstyleshairsalon@gmail.com to contacts
- Check spam folder
- Consider setting up SPF/DKIM records

### Debug Commands

```bash
# Test email service
cd backend
node -e "
const { sendEmail } = require('./utils/emailService');
sendEmail('test@example.com', {
  subject: 'Test Email',
  html: '<h1>Test</h1>'
}).then(console.log).catch(console.error);
"
```

## Security Notes

- ✅ App passwords are more secure than regular passwords
- ✅ Each app password is unique and can be revoked
- ✅ Environment variables keep credentials secure
- ✅ Email templates are sanitized to prevent injection

## Production Deployment

For production deployment on Render:

1. Add environment variables in Render dashboard:
   - `EMAIL_USER`: cstyleshairsalon@gmail.com
   - `EMAIL_PASSWORD`: Your app password
   - Other required environment variables

2. Ensure the backend service has access to send emails

3. Test email functionality after deployment

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify Gmail app password configuration
3. Test with a simple email first
4. Contact support if problems persist

---

**Last Updated:** December 2024
**Version:** 1.0
