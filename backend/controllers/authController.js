const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } = require('../utils/generateToken');
const userModel = require('../models/User');
const roomModel = require('../models/Room');
const crypto = require('crypto');
const logger = require('../utils/logger');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getCookieOptions = (maxAge) => {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge,
        path: "/",
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

            try {
                setAuthCookies(res, accessToken, refreshToken);
            } catch (error) {
                console.log("Failed to store cookies: ", error);            
            }

            return res.status(201).json({ success: true, auth: true, user: sanitizeUser(user) });
        }

        return res.status(400).json({ success: false, auth: false, message: "This user already registered!" });
    } catch (err) {
        logger.error("auth.register.error", { error: err.message, stack: err.stack, requestId: req.id });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


module.exports.loginUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
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
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password and confirm password should be same" });
        }

        if (password.trim().length < 4) {
            return res.status(400).json({ success: false, message: "Password should contain at least 4 characters" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: "Email not registered" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.refreshTokenHash = undefined;
        user.refreshTokenExpires = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        logger.error("auth.forgot-password.error", { error: err.message, stack: err.stack, requestId: req.id });
        return res.status(500).json({ success: false, message: "Internal Server Error" });
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
