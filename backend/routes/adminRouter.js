const express = require('express');
const { validateUser } = require('../middleware/validateUser');
const { isAdmin } = require('../middleware/isAdmin');
const { createClassroom, getClassroomData, exportEvalutionToCSV, openClassroom, closeClassroom, deleteClassroom } = require('../controllers/classroomController');
const router = express();

router.post('/createRoom', validateUser, isAdmin, createClassroom);
router.get('/getRoomData/:roomId', validateUser, getClassroomData);
router.get('/export/:roomID', validateUser, isAdmin, exportEvalutionToCSV);
router.get('/openRoom/:roomID', validateUser, isAdmin, openClassroom);
router.get('/closeRoom/:roomID', validateUser, isAdmin, closeClassroom);
router.delete('/:roomID/delete', validateUser, isAdmin, deleteClassroom);

module.exports = router;