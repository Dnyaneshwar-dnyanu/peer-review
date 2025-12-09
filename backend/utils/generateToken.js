const jwt = require('jsonwebtoken');

const generateToken = (user) => {
     return jwt.sign({ email: user.email, _id: user._id}, process.env.JWT_KEY)
}

module.exports.generateToken = generateToken;