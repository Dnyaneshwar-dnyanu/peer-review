const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const roomModel = require('../models/Room');
const userModel = require('../models/User');


router.get('/room/:roomCode', validateUser, async (req, res) => {
     let room = await roomModel.findOne({ roomCode: req.params.roomCode });

     if (room) {
          let isInsideRoom = room.participants.find(
               item => item.toString() === req.user._id.toString()
          )
          if (!isInsideRoom) {
               room.participants.push(req.user._id);
               await room.save();
          }
          return res.send({ success: true, message: "Joined the room", roomID: room._id });
     }

     res.send({ success: false, message: "Invalid Code" });
});

router.get('/:projectID/isUserProject', validateUser, async (req, res) => {
     let user = await userModel.findById(req.user._id);

     let status = user.projects.some( 
          pId => pId.toString() == req.params.projectID
     );

     res.send({ status });
});

module.exports = router;