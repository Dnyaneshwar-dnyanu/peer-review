const express = require('express');
const { registerUser, loginUser, updatePassword, logoutUser } = require('../controllers/authController');
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');
const router = express();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/updatePassword', updatePassword);

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

router.get('/logoutUser', validateUser, logoutUser);

module.exports = router;