const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const { generateToken } = require('../utils/generateToken')
const userModel = require('../models/User');
const roomModel = require('../models/Room');

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

            user.password = undefined;
            let token = generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(201).json({ success: true, auth: true, user: user, token: token });
        }

        return res.status(400).json({ success: false, auth: false, message: "This user already registered!" });
    } catch (err) {
        console.error("Unexpected Register Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.loginUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                user.password = undefined;
                let token = generateToken(user);
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 24 * 60 * 60 * 1000
                });
                return res.status(200).json({ success: true, auth: true, user: user, token: token });
            }
            return res.status(401).json({ success: false, auth: false, message: "Invalid email or password" });
        }
        return res.status(401).json({ success: false, auth: false, message: "Invalid email or password" });
    } catch (err) {
        console.error("Unexpected Login Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.updatePassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (err) {
        console.error("Unexpected Update Password Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

        res.cookie('token', "", { expires: new Date(0) });
        res.status(200).json({ success: true, auth: false });
    } catch (err) {
        console.error("Unexpected Logout Error:", err);
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
        console.error("Unexpected Validate Student Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
