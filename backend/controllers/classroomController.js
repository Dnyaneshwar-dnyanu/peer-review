const userModel = require('../models/User');
const roomModel = require('../models/Room');
const reviewModel = require('../models/Reviews');
const projectModel = require('../models/Projects');
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require("exceljs");
const logger = require('../utils/logger');

const isUserIdMatch = (value, userId) => {
    if (!value || !userId) return false;
    return value.toString() === userId.toString();
};

const isProjectMember = (project, userId) => {
    if (!project || !userId) return false;
    const userIdStr = userId.toString();
    const studentId = project.student?._id || project.student;

    if (studentId && studentId.toString() === userIdStr) return true;

    if (Array.isArray(project.members)) {
        return project.members.some((member) => String(member.id) === userIdStr);
    }

    return false;
};

const canAccessRoom = (room, user) => {
    if (!room || !user) return false;

    if (user.role === 'admin') {
        return isUserIdMatch(room.createdBy, user._id);
    }

    const isParticipant = room.participants?.some((participant) =>
        participant.toString() === user._id.toString()
    );

    if (isParticipant) return true;

    return Array.isArray(room.projects) && room.projects.some((project) =>
        isProjectMember(project, user._id)
    );
};

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
        logger.error("classroom.create.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
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
        logger.error("classroom.open.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.closeClassroom = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomID });
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        room.roomCode = "";
        room.status = "CLOSED";
        await room.save();

        res.status(200).json({ success: true, code: room.roomCode, message: "Room Closed Successfully" });
    } catch (err) {
        logger.error("classroom.close.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
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
        logger.error("classroom.delete.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports.exportEvalutionToExcel = async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.params.roomID })
            .populate({
                path: 'projects',
                populate: {
                    path: 'student',
                    select: 'name usn'
                }
            });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Guide Allotment');

        // 🔹 TITLE (merged)
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `${room.roomName} Projects Evaluation (Sem: ${room.semester}, Sec: ${room.section})`;
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // 🔹 HEADER
        const header = ["SI. No.", "USN", "Name of the Students", "Project Title", "Marks"];
        const headerRow = worksheet.addRow(header);

        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center' };

        headerRow.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        let rowIndex = 3;
        let serialNo = 1;

        room.projects.forEach(project => {

            const startRow = rowIndex;

            if (project.type === 'group') {

                const students = [
                    {
                        name: project.student?.name,
                        usn: project.student?.usn
                    },
                    ...(project.members || [])
                ];

                students.forEach((stu, i) => {
                    const row = worksheet.addRow([
                        i === 0 ? serialNo : "",
                        stu.usn || "N/A",
                        stu.name || "N/A",
                        i === 0 ? project.title : "",
                        i === 0 ? project.avgMarks : ""
                    ]);

                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    });

                    rowIndex++;
                });

                worksheet.mergeCells(`A${startRow}:A${rowIndex - 1}`);
                worksheet.mergeCells(`D${startRow}:D${rowIndex - 1}`);
                worksheet.mergeCells(`E${startRow}:E${rowIndex - 1}`);

                serialNo++;
            }

            else {
                const row = worksheet.addRow([
                    serialNo,
                    project.student?.usn || "N/A",
                    project.student?.name || "N/A",
                    project.title,
                    project.avgMarks
                ]);

                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });

                rowIndex++;
                serialNo++;
            }
        });

        // 🔹 Column width
        worksheet.columns = [
            { width: 7 },
            { width: 15 },
            { width: 30 },
            { width: 30 },
            { width: 10 }
        ];

        worksheet.columns[0].alignment = { horizontal: 'center'};
        worksheet.columns[4].alignment = { horizontal: 'center'};

        // 🔹 Response
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${room.roomName}_${room.semester}_${room.section}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        logger.error("classroom.export.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: 'Failed to download file' });
    }
};

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
        logger.error("classroom.join.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
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
        logger.error("classroom.exit.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
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

        if (!canAccessRoom(room, req.user)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({ success: true, room: room, projects: room.projects });
    } catch (err) {
        logger.error("classroom.get.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
