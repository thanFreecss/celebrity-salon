const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    bookingConfirmation: async (bookingData) => {
        // Generate QR code for Google Maps location
        const googleMapsUrl = 'https://maps.app.goo.gl/DABWfSgZf4HH4iCW8';
        const qrCodeDataUrl = await QRCode.toDataURL(googleMapsUrl);
        
        return {
            subject: '✅ Booking Confirmed – Celebrity Styles Hair Salon',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Booking Confirmation</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f5f5f5;
                        }
                        .container {
                            background: white;
                            border-radius: 15px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #E43636 0%, #c62828 100%);
                            color: white;
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: bold;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .greeting {
                            font-size: 18px;
                            margin-bottom: 30px;
                            color: #333;
                        }
                        .appointment-details {
                            background: #f8f9fa;
                            padding: 25px;
                            border-radius: 12px;
                            margin: 25px 0;
                            border-left: 5px solid #E43636;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 12px 0;
                            padding: 8px 0;
                            border-bottom: 1px solid #e9ecef;
                        }
                        .detail-row:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-weight: bold;
                            color: #495057;
                            min-width: 120px;
                        }
                        .value {
                            color: #333;
                            text-align: right;
                            flex: 1;
                        }
                        .location-section {
                            background: #e8f4fd;
                            padding: 25px;
                            border-radius: 12px;
                            margin: 25px 0;
                            border-left: 5px solid #2196f3;
                        }
                        .contact-section {
                            background: #fff3cd;
                            padding: 25px;
                            border-radius: 12px;
                            margin: 25px 0;
                            border-left: 5px solid #ffc107;
                        }
                        .qr-section {
                            text-align: center;
                            margin: 25px 0;
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 12px;
                        }
                        .qr-code {
                            max-width: 150px;
                            margin: 15px auto;
                            display: block;
                        }
                        .reminder-section {
                            background: #d1ecf1;
                            padding: 25px;
                            border-radius: 12px;
                            margin: 25px 0;
                            border-left: 5px solid #17a2b8;
                        }
                        .reminder-list {
                            margin: 15px 0;
                            padding-left: 20px;
                        }
                        .reminder-list li {
                            margin: 8px 0;
                            color: #495057;
                        }
                        .reschedule-btn {
                            display: inline-block;
                            background: #E43636;
                            color: white;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                            margin: 15px 0;
                            transition: background 0.3s ease;
                        }
                        .reschedule-btn:hover {
                            background: #c62828;
                        }
                        .footer {
                            background: #343a40;
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .footer p {
                            margin: 5px 0;
                            font-size: 14px;
                        }
                        .highlight {
                            background: #fff3cd;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid #ffc107;
                        }
                        .emoji {
                            font-size: 20px;
                            margin-right: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Booking Confirmed</h1>
                            <p>Celebrity Styles Hair Salon</p>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hi <strong>${bookingData.fullName}</strong>,<br>
                                Your appointment has been successfully confirmed at Celebrity Styles Hair Salon.<br>
                                We're excited to have you!
                            </div>
                            
                            <div class="appointment-details">
                                <h3><span class="emoji">🗓</span>Appointment Details:</h3>
                                <div class="detail-row">
                                    <span class="label">Date:</span>
                                    <span class="value">${new Date(bookingData.appointmentDate).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Time:</span>
                                    <span class="value">${bookingData.selectedTime}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Service:</span>
                                    <span class="value">${bookingData.service}</span>
                                </div>
                                ${bookingData.stylistName ? `
                                <div class="detail-row">
                                    <span class="label">Stylist:</span>
                                    <span class="value">${bookingData.stylistName}</span>
                                </div>
                                ` : ''}
                                <div class="detail-row">
                                    <span class="label">Total Amount:</span>
                                    <span class="value">₱${bookingData.totalAmount}</span>
                                </div>
                            </div>
                            
                            <div class="location-section">
                                <h3><span class="emoji">📍</span>Location:</h3>
                                <p><strong>Q2V4+988 Bauan, Batangas</strong><br>
                                13°47'36.3"N 121°00'21.0"E</p>
                                
                                <a href="${googleMapsUrl}" target="_blank" style="color: #2196f3; text-decoration: none; font-weight: bold;">
                                    📎 View on Google Maps
                                </a>
                            </div>
                            
                            <div class="qr-section">
                                <h3><span class="emoji">📸</span>QR Code (Location):</h3>
                                <img src="${qrCodeDataUrl}" alt="QR Code for Google Maps Location" class="qr-code">
                                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                                    Scan this QR code to get directions to our salon
                                </p>
                            </div>
                            
                            <div class="contact-section">
                                <h3><span class="emoji">📞</span>Contact Info:</h3>
                                <p><strong>Phone:</strong> (0917)-1386-028<br>
                                <strong>Email:</strong> cstyleshairsalon@gmail.com</p>
                            </div>
                            
                            <div class="highlight">
                                <strong>🔔 Important Reminder:</strong><br>
                                If your assigned stylist becomes unavailable due to an emergency, we'll notify you as soon as possible.<br>
                                You'll have the option to:<br>
                                • Proceed with another available stylist<br>
                                • Or reschedule your appointment
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <h3><span class="emoji">🔁</span>Need to make changes?</h3>
                                <a href="#" class="reschedule-btn">Reschedule Appointment</a>
                            </div>
                            
                            <div class="reminder-section">
                                <h3><span class="emoji">💡</span>Before Your Appointment:</h3>
                                <ul class="reminder-list">
                                    <li>Arrive 5–10 minutes early for check-in</li>
                                    <li>Avoid using heavy products in your hair</li>
                                    <li>Feel free to bring inspo photos for your desired look</li>
                                    <li>Let us know if you have any allergies or sensitivities</li>
                                </ul>
                            </div>
                            
                            <p style="text-align: center; font-size: 16px; margin: 30px 0;">
                                Thank you for trusting Celebrity Styles Hair Salon.<br>
                                <strong>See you soon!</strong>
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>If you have any questions, please contact us directly.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
    },
    
    bookingCancellation: (bookingData) => ({
        subject: '❌ Booking Cancelled - Celebrity Styles Hair Salon',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Booking Cancellation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: #f44336;
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .booking-details {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #f44336;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>❌ Booking Cancelled</h1>
                    <p>Your appointment has been cancelled</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${bookingData.fullName}</strong>,</p>
                    
                    <p>We regret to inform you that your booking has been cancelled.</p>
                    
                    <div class="booking-details">
                        <h3>Cancelled Appointment Details</h3>
                        <p><strong>Service:</strong> ${bookingData.service}</p>
                        <p><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${bookingData.selectedTime}</p>
                    </div>
                    
                    <p>If you would like to reschedule your appointment, please contact us to book a new time slot.</p>
                    
                    <p>We apologize for any inconvenience this may have caused.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Celebrity Styles Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </body>
            </html>
        `
    }),

    passwordReset: (resetData) => ({
        subject: '🔐 Password Reset Request - Celebrity Styles Hair Salon',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .reset-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        margin: 20px 0;
                    }
                    .warning {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                    <p>Celebrity Styles Hair Salon</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${resetData.name}</strong>,</p>
                    
                    <p>We received a request to reset your password for your Celebrity Styles Hair Salon account.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetData.resetUrl}" class="reset-button">Reset Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong>
                        <ul>
                            <li>This link will expire in 10 minutes</li>
                            <li>If you didn't request this password reset, please ignore this email</li>
                            <li>For security reasons, this link can only be used once</li>
                        </ul>
                    </div>
                    
                    <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">${resetData.resetUrl}</p>
                    
                    <p>If you have any questions or need assistance, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Celebrity Styles Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>If you didn't request this password reset, please contact us immediately.</p>
                </div>
            </body>
            </html>
        `
    }),

    otpVerification: (otpData) => ({
        subject: '🔐 Password Reset OTP - Celebrity Styles Hair Salon',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset OTP</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        border-radius: 15px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #E43636 0%, #c62828 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 30px;
                        color: #333;
                    }
                    .otp-section {
                        background: #f8f9fa;
                        padding: 30px;
                        border-radius: 12px;
                        margin: 25px 0;
                        border-left: 5px solid #E43636;
                        text-align: center;
                    }
                    .otp-code {
                        font-size: 48px;
                        font-weight: bold;
                        color: #E43636;
                        letter-spacing: 8px;
                        margin: 20px 0;
                        font-family: 'Courier New', monospace;
                        background: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        border: 2px dashed #E43636;
                    }
                    .warning {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 25px 0;
                    }
                    .warning ul {
                        margin: 10px 0;
                        padding-left: 20px;
                    }
                    .warning li {
                        margin: 5px 0;
                    }
                    .contact-section {
                        background: #e8f4fd;
                        padding: 25px;
                        border-radius: 12px;
                        margin: 25px 0;
                        border-left: 5px solid #2196f3;
                    }
                    .footer {
                        background: #343a40;
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .emoji {
                        font-size: 20px;
                        margin-right: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset OTP</h1>
                        <p>Celebrity Styles Hair Salon</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hi <strong>${otpData.name}</strong>,<br>
                            You requested to reset your password. Use the OTP code below to complete the process.
                        </div>
                        
                        <div class="otp-section">
                            <h3><span class="emoji">🔢</span>Your OTP Code:</h3>
                            <div class="otp-code">${otpData.otp}</div>
                            <p style="font-size: 16px; color: #666; margin-top: 15px;">
                                Enter this 6-digit code on the password reset page
                            </p>
                        </div>
                        
                        <div class="warning">
                            <strong><span class="emoji">⚠️</span>Important Security Information:</strong>
                            <ul>
                                <li>This OTP will expire in <strong>5 minutes</strong></li>
                                <li>This OTP can only be used <strong>once</strong></li>
                                <li>If you didn't request this password reset, please ignore this email</li>
                                <li>Never share this OTP with anyone</li>
                            </ul>
                        </div>
                        
                        <div class="contact-section">
                            <h3><span class="emoji">📞</span>Need Help?</h3>
                            <p>If you have any questions or need assistance, please contact us:</p>
                            <p><strong>Phone:</strong> (0917)-1386-028<br>
                            <strong>Email:</strong> cstyleshairsalon@gmail.com</p>
                        </div>
                        
                        <p style="text-align: center; font-size: 16px; margin: 30px 0;">
                            Thank you for choosing Celebrity Styles Hair Salon.<br>
                            <strong>Stay beautiful!</strong>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>If you didn't request this password reset, please contact us immediately.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
};

// Send email function
const sendEmail = async (to, template, data) => {
    try {
        let emailContent;
        
        // Handle both template name (string) and direct template object
        if (typeof template === 'string') {
            emailContent = emailTemplates[template](data);
        } else {
            emailContent = template; // Direct template object
        }
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: emailContent.subject,
            html: emailContent.html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send booking confirmation email
const sendBookingConfirmation = async (bookingData) => {
    try {
        const template = await emailTemplates.bookingConfirmation(bookingData);
        return await sendEmail(bookingData.email, template, null);
    } catch (error) {
        console.error('Error sending booking confirmation:', error);
        throw error;
    }
};

// Send booking cancellation email
const sendBookingCancellation = async (bookingData) => {
    return await sendEmail(bookingData.email, 'bookingCancellation', bookingData);
};

// Send password reset email
const sendPasswordReset = async (resetData) => {
    return await sendEmail(resetData.email, 'passwordReset', resetData);
};

// Send OTP verification email
const sendOTPVerification = async (otpData) => {
    return await sendEmail(otpData.email, 'otpVerification', otpData);
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendPasswordReset,
    sendOTPVerification
}; 