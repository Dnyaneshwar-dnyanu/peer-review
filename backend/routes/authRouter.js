const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { validateUser } = require('../middleware/validateUser');
const router = express();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/validateUser', validateUser, (req, res) => {
     res.send({ auth: true, user: req.user });
});

router.get('/logoutUser', logoutUser);


module.exports = router;