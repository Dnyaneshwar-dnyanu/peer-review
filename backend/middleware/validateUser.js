const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports.validateUser = async (req, res, next) => {
     let token = req.cookies.token;

     if (!token) {
          return res.status(401).json({ success: false, auth: false, message: "No token provided" });
     }

     try {
          let decoded = jwt.verify(token, process.env.JWT_KEY);
          let user = await userModel.findOne({email: decoded.email }).select('-password');
          
          if (!user) {
               return res.status(401).json({ success: false, auth: false, message: "User not found" });
          }

          req.user = user;  
          next();
     } catch (err) {
          logger.warn("auth.jwt.invalid", { error: err.message, requestId: req.id });
          return res.status(401).json({ success: false, auth: false, message: "Invalid or expired token" });
     }
}
