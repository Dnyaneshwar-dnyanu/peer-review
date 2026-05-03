const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } = require('../utils/generateToken');
const userModel = require('../models/User');
const roomModel = require('../models/Room');
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail");
const logger = require('../utils/logger');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getCookieOptions = (maxAge) => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge
    };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("token", accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
};

const clearAuthCookies = (res) => {
    const clearOptions = { ...getCookieOptions(0), maxAge: 0, expires: new Date(0) };
    res.cookie("token", "", clearOptions);
    res.cookie("refreshToken", "", clearOptions);
};

const sanitizeUser = (user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    delete safeUser.refreshTokenHash;
    delete safeUser.refreshTokenExpires;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;
    delete safeUser.verificationToken;
    delete safeUser.verificationTokenExpires;
    return safeUser;
};

module.exports.registerUser = async (req, res) => {
    try {
        let user;
        let { name, usn, email, role, password } = req.body;

        if (usn) usn = usn.trim().toUpperCase();

        if (role === "student") {
            user = await userModel.findOne(
                {
                    $or: [
                        { usn: usn },
                        { email: email }
                    ]
                });
        }
        else {
            user = await userModel.findOne({ email: email });
        }

        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            user = await userModel.create({
                name, usn, email, role, password: hash
            });

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken();

            user.refreshTokenHash = hashToken(refreshToken);
            user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
            await user.save();

            setAuthCookies(res, accessToken, refreshToken);

            return res.status(201).json({ success: true, auth: true, user: sanitizeUser(user) });
        }

        return res.status(400).json({ success: false, auth: false, message: "This user already registered!" });
    } catch (err) {
        logger.error("auth.register.error", { error: err.message, stack: err.stack, requestId: req.id });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


module.exports.sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email not registered",
            });
        }

        if (user.isVerified) {
            return res.json({
                success: false,
                message: "User already verified",
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");

        // Set expiry (5 minutes)
        user.verificationToken = token;
        user.verificationTokenExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        // Send email
        const subject = "Verify your email";

        const link = `${process.env.FRONTEND_URL}/verify/email?token=${token}`;

        const html = `
                        <div style="font-family: Arial; padding: 20px;">
                            <h2>Email Verification</h2>
                            <p>Click below:</p>
                            <a href="${link}" 
                            style="padding:10px 15px; background:#4f46e5; color:white; text-decoration:none;">
                            Verify Email
                            </a>
                        </div>
                    `;

        await sendEmail(user.email, subject, html);

        return res.json({
            success: true,
            message: "Verification email sent",
        });

    } catch (err) {
        logger.error("auth.verify-email.error", { error: err.message, stack: err.stack, requestId: req.id });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports.verifyUser = async (req, res) => {
    try {
        const { email, token } = req.body;

        const user = await userModel.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token",
            });
        }

        // ✅ Mark verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // 📩 Welcome email
        const subject = "Welcome to Peer Review Platform";

        const html = `
                        <h2>Welcome 🎉</h2>
                        <p>Your email has been successfully verified.</p>
                        <p>You can now login and start using the platform.</p>
                    `;

        await sendEmail(user.email, subject, html);

        return res.json({
            success: true,
            message: "Email verified successfully",
        });

    } catch (err) {
        logger.error("auth.verify-token.error", { error: err.message, stack: err.stack, requestId: req.id });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            if (!user.isVerified) {
                return res.json({
                    auth: false,
                    message: "Please verify your email first"
                });
            }

            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken();

                user.refreshTokenHash = hashToken(refreshToken);
                user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
                await user.save();

                setAuthCookies(res, accessToken, refreshToken);

                return res.status(200).json({ success: true, auth: true, user: sanitizeUser(user) });
            }
            return res.status(401).json({ success: false, auth: false, message: "Invalid email or password" });
        }
        return res.status(401).json({ success: false, auth: false, message: "Invalid email or password" });
    } catch (err) {
        logger.error("auth.login.error", { error: err.message, stack: err.stack, requestId: req.id });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenHash = hashToken(resetToken);

            user.resetPasswordToken = resetTokenHash;
            user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min

            await user.save();

            const subject = "Reset your password";
            const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            const html = `
                    <div style="font-family: Arial; padding: 20px;">
                        <h2>Password Reset</h2>
                        <p>You requested to reset your password.</p>
                        <p>This link will expire in 10 minutes.</p>

                        <a href="${resetURL}" 
                        style="padding:10px 15px; background:#4f46e5; color:white; text-decoration:none; display:inline-block; margin-top:10px;">
                            Reset Password
                        </a>

                        <p style="margin-top:20px; font-size:12px; color:gray;">
                            If you did not request this, please ignore this email.
                        </p>
                    </div>
                `;

            await sendEmail(user.email, subject, html);
        }

        res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }
    catch (err) {
        logger.error("auth.forgot-password.error", { error: err.message, stack: err.stack, requestId: req.id });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: "Token and password are required" });
        }

        const resetTokenHash = hashToken(token);

        let user = await userModel.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshTokenHash = undefined;
        user.refreshTokenExpires = undefined;

        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) {
        logger.error("auth.reset-password.error", { error: err.message, stack: err.stack, requestId: req.id });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token missing" });
        }

        const refreshTokenHash = hashToken(refreshToken);
        const user = await userModel.findOne({
            refreshTokenHash,
            refreshTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            clearAuthCookies(res);
            return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken();

        user.refreshTokenHash = hashToken(newRefreshToken);
        user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
        await user.save();

        setAuthCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({ success: true });
    } catch (err) {
        logger.error("auth.refresh-token.error", { error: err.message, stack: err.stack, requestId: req.id });
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.logoutUser = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            let rooms = await roomModel.find({ createdBy: req.user._id });
            await Promise.all(rooms.map(async (room) => {
                room.status = 'CLOSED';
                room.roomCode = "";
                room.participants = [];
                await room.save();
            }));
        }

        await userModel.updateOne(
            { _id: req.user._id },
            { $unset: { refreshTokenHash: 1, refreshTokenExpires: 1 } }
        );

        clearAuthCookies(res);
        res.status(200).json({ success: true, auth: false });
    } catch (err) {
        logger.error("auth.logout.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.validateStudent = async (req, res) => {
    try {
        let usn = req.body.usn;
        if (!usn) return res.status(400).json({ success: false, message: "USN is required" });

        usn = usn.trim().toUpperCase();

        if (usn === req.user.usn.toUpperCase()) {
            return res.status(400).json({ success: false, message: "You are already in the group" })
        }

        const user = await userModel.findOne({ usn: usn });

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid USN" });
        }

        res.status(200).json({ success: true, _id: user._id, name: user.name });
    } catch (err) {
        logger.error("auth.validate-student.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
