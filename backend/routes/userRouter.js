const express = require('express');
const router = express.Router();
const { validateUser } = require('../middleware/validateUser');
const { joinClassroom, exitClassroom, getClassroomData } = require('../controllers/classroomController');
const { isUserProject } = require('../controllers/userController')

router.post('/room/:roomCode/join', validateUser, joinClassroom);

router.get('/getRoomData/:roomId', validateUser, getClassroomData);

router.get('/:projectID/isUserProject', validateUser, isUserProject);

router.post('/:roomID/exit', validateUser, exitClassroom);

module.exports = router;