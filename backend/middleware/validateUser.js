const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports.validateUser = async (req, res, next) => {
     let token = req.cookies.token;

     // Also check Authorization header (Bearer token)
     if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
          token = req.headers.authorization.split(' ')[1];
     }

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
          console.error("JWT Verification Error:", err.message);
          return res.status(401).json({ success: false, auth: false, message: "Invalid or expired token" });
     }
}
