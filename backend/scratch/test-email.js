const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Using SMTP Configuration:');
console.log('Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('Port:', process.env.SMTP_PORT || '587');
console.log('Secure:', process.env.SMTP_SECURE === 'true');
console.log('User:', process.env.SMTP_USER);
console.log('Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.SMTP_USER || '', 
        pass: process.env.SMTP_PASS || ''  
    }
});

const mailOptions = {
    from: `"${process.env.PLATFORM_NAME || 'ICT Academy'}" <${process.env.SMTP_USER}>`,
    to: 'academyict3@gmail.com', // Sending a test mail to ourselves
    subject: 'Test Email from LMS Backend',
    text: 'If you receive this, email configuration is working perfectly!',
};

transporter.sendMail(mailOptions)
    .then(info => {
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error sending email:', err);
        process.exit(1);
    });
