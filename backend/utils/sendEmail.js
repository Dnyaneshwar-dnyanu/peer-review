const nodemailer = require('nodemailer');
const dns = require('dns');
const logger = require('./logger');

const getEmailProvider = () => {
    if (process.env.EMAIL_PROVIDER) return process.env.EMAIL_PROVIDER;
    return process.env.NODE_ENV === 'production' ? 'resend' : 'gmail';
};

const createSmtpTransport = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === 'true'
        : port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        // Force IPv4 to avoid IPv6-only routes in some hosts.
        family: 4,
        lookup: (hostname, options, cb) => {
            dns.lookup(hostname, { family: 4, all: false }, cb);
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendWithResend = async (to, subject, html) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const from = process.env.EMAIL_FROM || `Peer Review <${process.env.EMAIL_USER}>`;
    const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
    };

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Resend API error: ${response.status} ${text}`);
    }

    return response.json();
};

const sendEmail = async (to, subject, html) => {
    try {
        if (process.env.NODE_ENV === 'test') {
            logger.info('email.send.skipped', { to, subject });
            return { skipped: true };
        }

        const provider = getEmailProvider();

        if (provider === 'resend') {
            await sendWithResend(to, subject, html);
            return;
        }

        const transporter = createSmtpTransport();

        await transporter.sendMail({
            from: `"Peer Review <${process.env.EMAIL_USER}>"`,
            to,
            subject,
            html
        });
    } catch (err) {
        logger.error('email.send.error', { error: err.message, stack: err.stack, to });
        throw err;
    }
};

module.exports = sendEmail;