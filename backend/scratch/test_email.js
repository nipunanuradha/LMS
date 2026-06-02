const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

console.log('Env variables loaded:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS);

const host = (process.env.SMTP_HOST || 'smtp.gmail.com').replace(/['"]/g, '');
const port = parseInt((process.env.SMTP_PORT || '587').replace(/['"]/g, ''));
const secure = (process.env.SMTP_SECURE || '').replace(/['"]/g, '') === 'true';
const user = (process.env.SMTP_USER || '').replace(/['"]/g, '');
const pass = (process.env.SMTP_PASS || '').replace(/['"]/g, '');

const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
});

async function main() {
    try {
        console.log('Verifying transporter connection...');
        await transporter.verify();
        console.log('Transporter connection verified successfully!');
        
        console.log('Sending test email to academyict3@gmail.com...');
        const info = await transporter.sendMail({
            from: `"${process.env.PLATFORM_NAME || 'ICT Academy'}" <${user}>`,
            to: 'academyict3@gmail.com',
            subject: 'Test SMTP from LMS Backend',
            text: 'This is a test email.'
        });
        console.log('Test email sent successfully:', info.messageId);
    } catch (error) {
        console.error('SMTP test failed:', error);
    }
}

main();
