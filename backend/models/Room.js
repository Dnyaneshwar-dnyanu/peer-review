const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
     roomName: String,
     semester: String,
     section: String,
     maxMarks: Number,
     createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
     },
     roomCode: String,
     status: {
          type: String,
          enum: ['OPEN', 'CLOSED'],
          default: 'OPEN'
     },
     participants: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'User'
          }
     ],
     projects: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Project'
          }
     ]
});

module.exports = mongoose.model('Room', roomSchema);