const express = require('express');
const { validateUser } = require('../middleware/validateUser');
const { createClassroom, getClassroomData, exportEvalutionToCSV, openClassroom, closeClassroom, deleteClassroom } = require('../controllers/adminController');
const roomModel = require('../models/Room');
const userModel = require('../models/User');
const projectModel = require('../models/Projects');
const reviewModel = require('../models/Reviews');
const router = express();

router.post('/createRoom', validateUser, createClassroom);

router.get('/getRoomData/:roomId', validateUser, getClassroomData);

router.get('/export/:roomID', validateUser, exportEvalutionToCSV);

router.get('/openRoom/:roomID', validateUser, openClassroom);

router.get('/closeRoom/:roomID', validateUser, closeClassroom);

router.delete('/:roomID/delete', validateUser, deleteClassroom);

module.exports = router;