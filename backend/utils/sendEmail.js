const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (to, subject, html) => {
    try {
        if (process.env.NODE_ENV === 'test') {
            logger.info('email.send.skipped', { to, subject });
            return { skipped: true };
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
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