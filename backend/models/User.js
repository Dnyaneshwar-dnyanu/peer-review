const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
     name: String,
     usn: String,
     email: String,
     password: String,

     // "student" or "admin"
     role: {
          type: String,
          enum: ['student', 'admin'],
          required: true
     },

     // Only students will use this
     projects: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Project'
          }
     ],

     // Only admins will use this
     roomsCreated: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Room'
          }
     ]
});

module.exports = mongoose.model('User', userSchema);