const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
     title: String,
     description: String,
     avgMarks: Number,
     studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
     },
     reviews: [
          {
               User: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
               },
               markGiven: {
                    type: Number,
                    default: 0,
                    min: 0
               },
               comments: String
          }
     ],
     submittedAt: {
          default: Date.now,
          type: Date
     }
})

module.exports = mongoose.model('Project', projectSchema);