const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
     roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room'
     },
     projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project'
     },
     reviewerId: {
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

module.exports = mongoose.model('Review', reviewSchema);