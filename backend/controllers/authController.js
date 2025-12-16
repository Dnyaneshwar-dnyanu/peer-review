const bcrypt = require('bcrypt');
const cookie = require('cookie');
const { generateToken } = require('../utils/generateToken')
const userModel = require('../models/User');
const roomModel = require('../models/Room');

module.exports.registerUser = async (req, res) => {
     let user = await userModel.findOne({ email: req.body.email });

     if (!user) {
          let { name, usn, email, role, password } = req.body;

          bcrypt.genSalt(10, function (err, salt) {
               bcrypt.hash(password, salt, async function (err, hash) {
                    user = await userModel.create({
                         name, usn, email, role, password: hash
                    });

                    user.password = undefined;
                    let token = generateToken(user);
                    res.cookie('token', token);

                    return res.send({ auth: true, user: user });
               });
          });
          return;
     }

     return res.send({ auth: false, message: "This email already registered!"});
}

module.exports.loginUser = async (req, res) => {

     let user = await userModel.findOne({ email: req.body.email });

     if (user) {
          bcrypt.compare(req.body.password, user.password, (err, result) => {
               if (result) {
                    user.password = undefined;
                    let token = generateToken(user);
                    res.cookie('token', token);
                    return res.send({ auth: true, user: user });
               }
               return res.send({ auth: false, message: "Invalid password" });
          })
          return;
     }
     return res.send({ auth: false, message: "Invalid email" });
}

module.exports.updatePassword = async (req, res) => {
     let user = await userModel.findOne({ email: req.body.email });

     if (user) {
          bcrypt.genSalt(10, function (err, salt) {
               bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    user.password = hash;
                    await user.save();

                    return res.send({ success: true, message: "Password updated successfully!" });
               })
          })
          return;
     }

     return res.send({ success: false, message: "Invalid email" });
}

module.exports.logoutUser = async (req, res) => {
     if (req.user.role === 'admin') {
          let rooms = await roomModel.find({ createdBy: req.user._id });
          rooms.map(async (room) => {
               room.status = 'CLOSED';
               room.roomCode = "";
               room.participants = [];
               await room.save();
          })
     }

     res.cookie('token', "");
     res.send({ auth: false });
}