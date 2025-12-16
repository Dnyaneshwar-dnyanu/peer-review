const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const roomModel = require('../models/Room');


router.get('/room/:roomCode', validateUser, async (req, res) => {
     let room = await roomModel.findOne({ roomCode: req.params.roomCode });

     if (room) {
          let isInsideRoom = room.participants.find(
               item => item.toString() === req.user._id.toString()
          )
          console.log(isInsideRoom);
          
          if (!isInsideRoom) {
               room.participants.push(req.user._id);
               await room.save();
          }
          return res.send({ success: true, message: "Joined the room", roomID: room._id });
     }

     res.send({ success: false, message: "Invalid Code" });
});

module.exports = router;