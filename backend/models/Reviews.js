const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
     projectID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project'
     },
     reviewerID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
     },
     marks: Number,
     comment: {
          type: String,
          default: ""
     },
     reviewedAt: {
          type: Date,
          default: Date.now
     }
});

module.exports = mongoose.model('Reviewer', reviewSchema);