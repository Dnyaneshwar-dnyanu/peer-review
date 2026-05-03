const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
     name: String,

     // Only for students
     usn: {
          type: String,
          index: { 
               unique: true, 
               sparse: true // Allows multiple null/undefined values for admins
          }
     },

     email: {
          type: String,
          required: true,
          unique: true,
          index: true,
          lowercase: true,
          trim: true
     },
     password: {
          type: String,
          required: true
     },

     // "student" or "admin"
     role: {
          type: String,
          enum: ['student', 'admin'],
          required: true
     },

     // is email verified
     isVerified: {
          type: Boolean,
          default: false,
          index: true
     },

     // token (otp)
     verificationToken: {
          type: String,
          index: true
     },
     verificationTokenExpires: Date,

     // Verify email while reset password
     resetPasswordToken: {
          type: String,
          index: true
     },
     resetPasswordExpires: Date,

     // Refresh token (hashed)
     refreshTokenHash: String,
     refreshTokenExpires: Date,

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

// Add index for faster login/auth
userSchema.index({ email: 1, isVerified: 1 });

module.exports = mongoose.model('User', userSchema);