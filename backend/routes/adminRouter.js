const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateUser } = require('../middleware/validateUser');
const roomModel = require('../models/Room');
const userModel = require('../models/User');
const Projects = require('../models/Projects');
const router = express();

router.post('/createRoom', validateUser, async (req, res) => {
     let { roomName, semester, section, maxMarks } = req.body;

     let room = await roomModel.create({
          roomName, semester, section, maxMarks, createdBy: req.user._id, roomCode: uuidv4().slice(0, 6).toUpperCase()
     });

     let user = await userModel.findOne({ _id: req.user._id });

     user.roomsCreated.push(room._id);
     await user.save();

     res.send({ success: true, room: room });
});

router.get('/getRoomData/:roomId', validateUser, async (req, res) => {
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
          })

     res.send({ room: room, projects: room.projects });
});

router.get('/export/:roomID', validateUser, async (req, res) => {
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

})

router.get('/openRoom/:roomID', validateUser, async (req, res) => {
     let room = await roomModel.findOne({ _id: req.params.roomID });
     let code = uuidv4().slice(0, 6).toUpperCase();
     room.roomCode = code;
     room.status = "OPEN";
     await room.save();

     res.send({ code: code });
});

router.get('/closeRoom/:roomID', validateUser, async (req, res) => {
     let room = await roomModel.findOne({ _id: req.params.roomID });
     room.roomCode = "";
     room.status = "CLOSED";
     room.participants = [];
     await room.save();

     res.send({ success: true, code: room.roomCode, message: "Room Closed Successfully" });
});


module.exports = router;