const nodemailer = require('nodemailer');

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
    bookingConfirmation: (bookingData) => ({
        subject: '🎉 Your Booking is Confirmed! - Celebrity Styles Hair Salon',
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
                    .booking-details {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #667eea;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 10px 0;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #555;
                    }
                    .value {
                        color: #333;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 14px;
                    }
                    .highlight {
                        background: #e8f4fd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                        border-left: 4px solid #2196f3;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Booking Confirmed!</h1>
                    <p>Your appointment has been confirmed by Celebrity Styles Hair Salon</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>${bookingData.fullName}</strong>,</p>
                    
                    <p>Great news! Your booking has been confirmed. We're excited to see you!</p>
                    
                    <div class="booking-details">
                        <h3>📅 Appointment Details</h3>
                        <div class="detail-row">
                            <span class="label">Name:</span>
                            <span class="value">${bookingData.fullName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Service:</span>
                            <span class="value">${bookingData.service}</span>
                        </div>
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
                            <span class="label">Total Amount:</span>
                            <span class="value">₱${bookingData.totalAmount}</span>
                        </div>
                        ${bookingData.stylistName ? `
                        <div class="detail-row">
                            <span class="label">Stylist:</span>
                            <span class="value">${bookingData.stylistName}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="highlight">
                        <strong>📍 Location:</strong><br>
                        Celebrity Styles Hair Salon<br>
                        [Your Salon Address Here]<br>
                        [City, Province, ZIP Code]
                    </div>
                    
                    <div class="highlight">
                        <strong>📞 Contact Information:</strong><br>
                        Phone: [Your Phone Number]<br>
                        Email: [Your Email]<br>
                        Business Hours: [Your Hours]
                    </div>
                    
                    <p><strong>Important Reminders:</strong></p>
                    <ul>
                        <li>Please arrive 10 minutes before your scheduled appointment</li>
                        <li>Bring any reference photos or specific requests you have</li>
                        <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                        <li>Payment is due at the time of service</li>
                    </ul>
                    
                    <p>We look forward to providing you with an amazing experience!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Celebrity Styles Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                    <p>If you have any questions, please contact us directly.</p>
                </div>
            </body>
            </html>
        `
    }),
    
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
    })
};

// Send email function
const sendEmail = async (to, template, data) => {
    try {
        const emailContent = emailTemplates[template](data);
        
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
    return await sendEmail(bookingData.email, 'bookingConfirmation', bookingData);
};

// Send booking cancellation email
const sendBookingCancellation = async (bookingData) => {
    return await sendEmail(bookingData.email, 'bookingCancellation', bookingData);
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation
}; 