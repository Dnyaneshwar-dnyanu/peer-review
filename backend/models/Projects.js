const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
     title: String,
     description: String,
     avgMarks: {
          type: Number,
          default: 0
     },
     type: {
          type: String,
          enum: ['individual', 'group'],
     },
     members: [{
          id: String,
          name: String,
          usn: String
     }],
     student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
     },
     reviews: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Reviewer'
          }
     ],
     submittedAt: {
          default: Date.now,
          type: Date
     }
});

module.exports = mongoose.model('Project', projectSchema);