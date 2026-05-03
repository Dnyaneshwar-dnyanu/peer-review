const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
     roomName: {
          type: String,
          required: true,
          trim: true
     },
     semester: String,
     section: String,
     maxMarks: Number,
     createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          index: true
     },
     createdAt: {
          type: Date,
          default: Date.now,
          index: true
     },
     roomCode: {
          type: String,
          index: {
               sparse: true // Only index if present (since it's cleared when room closes)
          }
     },
     status: {
          type: String,
          enum: ['OPEN', 'CLOSED'],
          default: 'CLOSED',
          index: true
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