const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, refreshToken, validateStudent, logoutUser, sendVerificationEmail, verifyUser, verifyResetToken } = require('../controllers/authController');
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');

const router = express();

router.post('/register', registerUser);

router.post('/verify', sendVerificationEmail);

router.post('/verify/token', verifyUser);

router.get('/verify/reset-token/:token', verifyResetToken);

router.get("/verify/status", async (req, res) => {
  const { email } = req.query;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false });
  }

  return res.json({
    success: true,
    isVerified: user.isVerified
  });
});

router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/refresh-token', refreshToken);

router.get('/validateUser', validateUser, (req, res) => {
     res.send({ auth: true, user: req.user });
});

router.get('/getData', validateUser, async (req, res) => {
     let user = await userModel.findOne({ _id: req.user._id }).select('-password');
     
     if (user.role === 'admin') {
          user = await user.populate('roomsCreated');
     } else {
          user = await user.populate('projects');
     }

     res.send({ success: true, user: user });     
});

router.post('/validateStudent', validateUser, validateStudent);

router.post('/logoutUser', validateUser, logoutUser);

module.exports = router;