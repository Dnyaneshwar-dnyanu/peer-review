const express = require('express');
const router = express.Router();
const { validateUser } = require('../middleware/validateUser');
const { joinClassroom, exitClassroom, getClassroomData } = require('../controllers/classroomController');
const { isUserProject } = require('../controllers/userController');
const rateLimit = require('express-rate-limit');

const joinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 join attempts per windowMs
    message: { success: false, message: "Too many join attempts, please try again later." }
});

router.post('/room/:roomCode/join', validateUser, joinLimiter, joinClassroom);
router.get('/getRoomData/:roomId', validateUser, getClassroomData);
router.get('/:projectID/isUserProject', validateUser, isUserProject);
router.post('/:roomID/exit', validateUser, exitClassroom);

module.exports = router;