const roomModel = require('../models/Room');
const userModel = require('../models/User');

module.exports.joinClassroom = async (req, res) => {
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
}

module.exports.isUserProject = async (req, res) => {
     const user = await userModel.findById(req.user._id);

     let status = user.projects.some( 
          pId => pId.toString() == req.params.projectID
     );
     res.send({ status });
}

module.exports.exitClassroom = async (req, res) => {
     let room = await roomModel.findById(req.params.roomID);

     if (!room) 
          return res.send({ success: false, message: "Failed to exit classroom"});

     room.participants = room.participants.filter(pId => pId != req.user._id);
     await room.save();

     res.send({ success: true, message: "Exited from Classroom"});
}