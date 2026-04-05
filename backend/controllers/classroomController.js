const userModel = require('../models/User');
const roomModel = require('../models/Room');
const reviewModel = require('../models/Reviews');
const projectModel = require('../models/Projects');
const { v4: uuidv4 } = require('uuid');

// --- Admin Services ---

module.exports.createClassroom = async (req, res) => {
    try {
        let { roomName, semester, section, maxMarks } = req.body;

        if (!roomName || !semester || !section || !maxMarks) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        let room = await roomModel.create({
            roomName, semester, section, maxMarks, createdBy: req.user._id, roomCode: ""
        });

        let user = await userModel.findOne({ _id: req.user._id });
        user.roomsCreated.push(room._id);
        await user.save();

        res.status(201).json({ success: true, room: room });
    } catch (err) {
        console.error("Unexpected Create Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.openClassroom = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomID });
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        let code = uuidv4().slice(0, 6).toUpperCase();
        room.roomCode = code;
        room.status = "OPEN";
        room.participants = []; // Clear participants to ensure a fresh session
        await room.save();

        res.status(200).json({ success: true, code: code });
    } catch (err) {
        console.error("Unexpected Open Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.closeClassroom = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomID });
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        room.roomCode = "";
        room.status = "CLOSED";
        room.participants = [];
        await room.save();

        res.status(200).json({ success: true, code: room.roomCode, message: "Room Closed Successfully" });
    } catch (err) {
        console.error("Unexpected Close Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.deleteClassroom = async (req, res) => {
    try {
        let roomID = req.params.roomID;
        let room = await roomModel.findById(roomID)
            .populate({
                path: "projects",
                populate: {
                    path: "reviews"
                }
            });

        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Delete reviews and projects in the room
        await Promise.all(room.projects.map(async project => {
            await reviewModel.deleteMany({
                _id: { $in: project.reviews.map(r => r._id) }
            });
            await projectModel.deleteOne({ _id: project._id });
        }));

        await roomModel.findByIdAndDelete(roomID);

        let user = await userModel.findById(req.user._id);
        if (user) {
            user.roomsCreated = user.roomsCreated.filter(rId => rId.toString() !== roomID.toString());
            await user.save();
        }

        res.status(200).json({ success: true, message: "Successfully deleted the classroom" });
    }
    catch (err) {
        console.error("Unexpected Delete Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports.exportEvalutionToCSV = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomID })
            .populate({
                path: 'projects',
                populate: {
                    path: 'student',
                    select: 'name usn'
                }
            });

        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        let csv = "Student Name, USN, Project Title, Marks\n";

        room.projects.forEach(project => {
            csv += `"${project.student.name}", ${project.student.usn}, ${project.title}, ${project.avgMarks}\n`;
        })

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${room.roomName}_${room.semester}_${room.section}.csv`
        )

        res.status(200).send(csv)
    }
    catch (err) {
        console.error("Unexpected Export CSV Error:", err);
        res.status(500).json({ success: false, message: 'Failed to download the file' });
    }
}

// --- Student Services ---

module.exports.joinClassroom = async (req, res) => {
    try {
        const { roomCode } = req.params;

        if (!roomCode || roomCode.trim() === "") {
            return res.status(400).json({ success: false, message: "Room code is required" });
        }

        // Only find rooms that are currently OPEN, and ensure code is uppercase
        let room = await roomModel.findOne({ 
            roomCode: roomCode.trim().toUpperCase(), 
            status: "OPEN" 
        });

        if (room) {
            let isInsideRoom = room.participants.find(
                item => item.toString() === req.user._id.toString()
            )
            if (!isInsideRoom) {
                room.participants.push(req.user._id);
                await room.save();
            }

            return res.status(200).json({ success: true, message: "Joined the room", roomID: room._id });
        }

        res.status(404).json({ success: false, message: "Invalid or Closed Room Code" });
    } catch (err) {
        console.error("Unexpected Join Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.exitClassroom = async (req, res) => {
    try {
        let room = await roomModel.findById(req.params.roomID);

        if (!room)
            return res.status(404).json({ success: false, message: "Room not found" });

        room.participants = room.participants.filter(pId => pId.toString() !== req.user._id.toString());
        await room.save();

        res.status(200).json({ success: true, message: "Exited from Classroom" });
    } catch (err) {
        console.error("Unexpected Exit Classroom Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// --- Shared Services ---

module.exports.getClassroomData = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomId })
            .populate({
                path: 'participants',
                select: 'name usn' // Only names and USNs
            })
            .populate({
                path: 'projects',
                select: 'title description student type members avgMarks submittedAt', // No unnecessary fields
                populate: {
                    path: 'student',
                    select: 'name usn'
                }
            });

        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        res.status(200).json({ success: true, room: room, projects: room.projects });
    } catch (err) {
        console.error("Unexpected Get Classroom Data Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
