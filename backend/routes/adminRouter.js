const express = require('express');
const { validateUser } = require('../middleware/validateUser');
const roomModel = require('../models/Room');
const userModel = require('../models/User');
const router = express();

router.post('/createRoom', validateUser, async (req, res) => {
     let { roomName, semester, section, maxMarks } = req.body;

     let room = await roomModel.create({
          roomName, semester, section, maxMarks, createdBy: req.user._id
     });

     let user = await userModel.findOne({ _id: req.user._id });

     user.roomsCreated.push(room._id);
     await user.save();

     res.send({success: true, room: room});
});


router.get('/getData', validateUser, async (req, res) => {
     let user = await userModel.findOne({ _id: req.user._id }).select('-password').populate('roomsCreated');

     res.send({ success: true, user: user });
});

router.get('/getRoomData/:roomId', validateUser, async (req, res) => {
     let room = await roomModel.findOne({ _id: req.params.roomId });

     res.send(room);
})

module.exports = router;