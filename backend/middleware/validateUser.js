const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports.validateUser = async (req, res, next) => {

     if (!req.cookies.token) {
          return res.send({auth: false});
     }

     let token = req.cookies.token;
     let decoded = jwt.verify(token, process.env.JWT_KEY);

     let user = await userModel.findOne({email: decoded.email }).select('-password');

     req.user = user;  
     
     next();
}