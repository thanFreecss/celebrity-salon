# Email Notification Setup Guide

This guide explains how to set up email notifications for booking confirmations and cancellations in the Celebrity Styles Hair Salon system.

## Overview

The system now includes automatic email notifications that are sent to customers when:
- A booking is confirmed by an admin
- A booking is cancelled by an admin

## Email Service Setup

### 1. Gmail Setup (Recommended)

The system uses Gmail SMTP for sending emails. Follow these steps to set up:

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Generate the password
6. Copy the 16-character password (you'll need this for the EMAIL_PASSWORD)

### 2. Environment Variables

Add these variables to your `config.env` file:

```env
# Email Configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

**Important Notes:**
- Use your full Gmail address for `EMAIL_USER`
- Use the 16-character app password (not your regular Gmail password) for `EMAIL_PASSWORD`
- Never commit your actual email credentials to version control

### 3. Alternative Email Services

If you prefer to use a different email service, you can modify the email configuration in `backend/utils/emailService.js`:

#### For Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransporter({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

#### For Custom SMTP:
```javascript
const transporter = nodemailer.createTransporter({
    host: 'your-smtp-host.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

## Email Templates

The system includes two email templates:

### 1. Booking Confirmation Email
- Sent when admin confirms a booking
- Includes appointment details, service information, and stylist name
- Contains salon contact information and important reminders

### 2. Booking Cancellation Email
- Sent when admin cancels a booking
- Includes cancelled appointment details
- Provides information about rescheduling

## Customizing Email Templates

You can customize the email templates by editing the `emailTemplates` object in `backend/utils/emailService.js`:

### Template Variables Available:
- `fullName`: Customer's full name
- `email`: Customer's email address
- `service`: Selected service
- `appointmentDate`: Appointment date
- `selectedTime`: Appointment time
- `totalAmount`: Service cost
- `stylistName`: Assigned stylist (if available)

### Customizing Salon Information:
Update the following sections in the confirmation email template:
- Salon address
- Phone number
- Email address
- Business hours

## Testing Email Functionality

### 1. Local Testing
1. Set up your environment variables
2. Start the backend server
3. Create a test booking
4. Use the admin panel to confirm the booking
5. Check the customer's email for the confirmation

### 2. Production Testing
1. Deploy with proper environment variables
2. Create a test booking
3. Confirm the booking via admin panel
4. Verify email delivery

## Troubleshooting

### Common Issues:

#### 1. "Invalid login" error
- Ensure you're using the app password, not your regular Gmail password
- Verify 2-factor authentication is enabled
- Check that the email address is correct

#### 2. "Authentication failed" error
- Regenerate the app password
- Ensure the email and password are correctly set in environment variables

#### 3. Emails not sending
- Check server logs for error messages
- Verify environment variables are loaded correctly
- Test SMTP connection manually

#### 4. Emails going to spam
- Add your email address to the customer's contacts
- Consider using a professional email service like SendGrid or Mailgun
- Ensure proper SPF and DKIM records are set up

## Security Considerations

1. **Never commit email credentials to version control**
2. Use environment variables for all sensitive information
3. Regularly rotate app passwords
4. Monitor email sending logs for suspicious activity
5. Consider rate limiting for email sending

## Production Deployment

### Render.com Setup:
1. Add environment variables in your Render dashboard:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: Your app password

2. Ensure the variables are set for both development and production environments

### Other Platforms:
- Follow the same environment variable setup process
- Ensure the email service is accessible from your deployment platform

## Monitoring and Logs

The system logs email sending activities:
- Successful email sends include the message ID
- Failed email sends include error details
- Check server logs for email-related messages

## Support

If you encounter issues with email setup:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify environment variable configuration
4. Test with a simple email service first 