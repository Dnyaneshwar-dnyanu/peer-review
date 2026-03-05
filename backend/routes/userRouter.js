const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const { joinClassroom, isUserProject, exitClassroom } = require('../controllers/userController')

router.get('/room/:roomCode/join', validateUser, joinClassroom);

router.get('/:projectID/isUserProject', validateUser, isUserProject);

router.get('/:roomID/exit', validateUser, exitClassroom);

module.exports = router;