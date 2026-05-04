const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
     projectID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project',
          required: true,
          index: true
     },
     reviewerID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          index: true
     },
     marks: {
          type: Number,
          required: true
     },
     comment: {
          type: String,
          default: ""
     },
     reviewedAt: {
          type: Date,
          default: Date.now,
          index: true
     }
});

// Ensure a user can only review a project once
reviewSchema.index({ projectID: 1, reviewerID: 1 }, { unique: true });

module.exports = mongoose.model('Reviewer', reviewSchema);