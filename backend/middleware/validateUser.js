const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports.validateUser = async (req, res, next) => {
     let token = req.cookies.token;

     // Also check Authorization header (Bearer token)
     if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
          token = req.headers.authorization.split(' ')[1];
     }

     if (!token) {
          return res.send({auth: false});
     }

     try {
          let decoded = jwt.verify(token, process.env.JWT_KEY);
          let user = await userModel.findOne({email: decoded.email }).select('-password');
          
          if (!user) {
               return res.send({auth: false});
          }

          req.user = user;  
          next();
     } catch (err) {
          console.error("JWT Verification Error:", err.message);
          return res.send({auth: false});
     }
}
