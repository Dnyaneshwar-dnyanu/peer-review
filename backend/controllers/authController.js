const bcrypt = require('bcrypt');
const cookie = require('cookie');
const {generateToken} = require('./../utils/generateToken')
const userModel = require('../models/User');

module.exports.registerUser = async (req, res) => {
     let user = await userModel.findOne({ email: req.body.usn });

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

     return res.send({ auth: false, user: user });
}

module.exports.loginUser = async (req, res) => {
     
     let user = await userModel.findOne({ email: req.body.email });
     
     if(user) {
          let { email, password } = req.body;
          bcrypt.compare(password, user.password, (err, result) => {
               if(result) {
                    let token = generateToken(user);
                    res.cookie('token', token);
                    return res.send({ auth: true, user: user});
               }
               return res.send({ auth: false, msg: "password is wrong"});
          })
          return;
     }
     return res.send({ auth: false, msg: "user email is wrong"});
}

module.exports.logoutUser = async (req, res) => {
     res.cookie('token', "");
     res.send({auth: false});
}