const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/['"]/g, '').trim();
const resendFrom = (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').replace(/['"]/g, '').trim();
const platformName = (process.env.PLATFORM_NAME || 'ICT Academy').replace(/['"]/g, '');

console.log('--- Resend Configuration Test ---');
console.log('RESEND_API_KEY:', resendApiKey ? `${resendApiKey.substring(0, 5)}... (Length: ${resendApiKey.length})` : 'MISSING');
console.log('RESEND_FROM_EMAIL:', resendFrom);
console.log('PLATFORM_NAME:', platformName);

if (!resendApiKey) {
    console.error('Error: RESEND_API_KEY is not defined in your .env file.');
    process.exit(1);
}

const testRecipient = 'academyict3@gmail.com'; // Change this to your test recipient email

async function runTest() {
    const fromHeader = (resendFrom.includes('<') && resendFrom.includes('>')) 
        ? resendFrom 
        : `${platformName} <${resendFrom}>`;
    console.log(`\nSending test email from "${fromHeader}" to "${testRecipient}"...`);
    
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromHeader,
                to: [testRecipient],
                subject: `Test Resend Email - ${platformName}`,
                text: 'This is a test email sent from the LMS Resend diagnostic script to verify domain and API delivery.',
                html: '<p>This is a test email sent from the LMS Resend diagnostic script to verify domain and API delivery.</p>'
            })
        });

        console.log('API Status Code:', response.status);
        console.log('API Status Text:', response.statusText);
        
        const data = await response.json();
        console.log('API Response Body:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\nSUCCESS: Resend accepted the email!');
            console.log('Please check the inbox (and spam folder) of:', testRecipient);
        } else {
            console.log('\nFAILURE: Resend API rejected the email.');
            if (data.message && data.message.includes('restricted')) {
                console.log('Reason: Your Resend account is still in sandbox mode (using onboarding@resend.dev). You can only send to your own registered email address.');
            } else {
                console.log('Please check your Domain Verification and API Key status on resend.com.');
            }
        }
    } catch (err) {
        console.error('\nNetwork or Runtime Error:', err);
    }
}

runTest();
