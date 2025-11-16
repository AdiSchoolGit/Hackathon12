import dotenv from 'dotenv';
dotenv.config(); // loads backend/.env

import sgMail from '@sendgrid/mail';

// Check that the key is actually loaded
if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY not found in .env file');
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: 'ajasti7720@sdsu.edu', // email you can check
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'SendGrid test from Hackathon backend',
    text: 'If you see this, SendGrid is working 🎉',
    html: '<h1>If you see this, SendGrid is working</h1>',
};

sgMail
    .send(msg)
    .then(() => {
        console.log('Test email sent successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error sending test email:', error);
        process.exit(1);
    });