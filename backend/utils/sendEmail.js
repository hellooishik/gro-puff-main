const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Return immediately if SMTP isn't fully configured to prevent Vercel timeouts
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP Credentials not fully configured. Email sending skipped.');
        console.warn(`Would have sent email to ${options.email} with subject: ${options.subject}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Winkin'} <${process.env.FROM_EMAIL || 'order@winkin.store'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email via SMTP:', error);
    }
};

module.exports = sendEmail;
