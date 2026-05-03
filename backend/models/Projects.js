const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
     title: {
          type: String,
          required: true,
          trim: true
     },
     description: String,
     avgMarks: {
          type: Number,
          default: 0,
          index: true
     },
     type: {
          type: String,
          enum: ['individual', 'group'],
          required: true,
          index: true
     },
     members: [{
          id: String,
          name: String,
          usn: String
     }],
     student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          index: true
     },
     reviews: [
          {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Reviewer'
          }
     ],
     submittedAt: {
          type: Date,
          default: Date.now,
          index: true
     }
});

module.exports = mongoose.model('Project', projectSchema);