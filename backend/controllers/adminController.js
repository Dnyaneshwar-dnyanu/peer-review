const userModel = require('../models/User');
const roomModel = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

module.exports.createClassroom = async (req, res) => {
    let { roomName, semester, section, maxMarks } = req.body;

    let room = await roomModel.create({
        roomName, semester, section, maxMarks, createdBy: req.user._id, roomCode: ""
    });

    let user = await userModel.findOne({ _id: req.user._id });

    user.roomsCreated.push(room._id);
    await user.save();

    res.send({ success: true, room: room });
}


module.exports.getClassroomData = async (req, res) => {
    let room = await roomModel.findOne({ _id: req.params.roomId })
        .populate({
            path: 'participants',
            select: 'name usn'
        })
        .populate({
            path: 'projects',
            populate: {
                path: 'student',
                select: 'name usn'
            }
        });

    res.send({ room: room, projects: room.projects });
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
        console.error(err);
        res.status(500).send('Failed to download the file');
    }
}


module.exports.openClassroom = async (req, res) => {
    let room = await roomModel.findOne({ _id: req.params.roomID });
    let code = uuidv4().slice(0, 6).toUpperCase();
    room.roomCode = code;
    room.status = "OPEN";
    await room.save();

    res.send({ code: code });
}


module.exports.closeClassroom = async (req, res) => {
    let room = await roomModel.findOne({ _id: req.params.roomID });
    room.roomCode = "";
    room.status = "CLOSED";
    room.participants = [];
    await room.save();

    res.send({ success: true, code: room.roomCode, message: "Room Closed Successfully" });
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
            return res.status(404).send({ success: false, message: "Room not found" });
        }

        for (const project of room.projects) {
            await reviewModel.deleteMany({
                _id: { $in: project.reviews.map(r => r._id) }
            });
        }

        await roomModel.findByIdAndDelete(roomID);

        let user = await userModel.findById(req.user._id);
        user.roomsCreated = user.roomsCreated.filter(rId => rId != roomID);
        await user.save();

        res.send({ success: true, message: "Successfully deleted the classroom" });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Error in deleting room" })
    }
}