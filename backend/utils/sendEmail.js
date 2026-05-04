const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (to, subject, html) => {
    try {
        if (process.env.NODE_ENV === 'test') {
            logger.info('email.send.skipped', { to, subject });
            return { skipped: true };
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            // Force IPv4 to avoid IPv6-only routes in some hosts.
            family: 4,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Peer Review <${process.env.EMAIL_USER}>"`,
            to: to,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);

    } catch (err) {
        logger.error("email.send.error", { error: err.message, stack: err.stack, to });
        throw err;
    }
}

module.exports = sendEmail;