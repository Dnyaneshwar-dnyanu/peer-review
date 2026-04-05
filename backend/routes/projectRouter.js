const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const { getProjectInfo, addProject, getProjects, addReviewToProject, getReviews, getReviewStatus, updateProject, deleteProject } = require('../controllers/projectController');
const { Mongoose } = require('mongoose');

router.get('/:projectID/getInfo', validateUser, getProjectInfo);

router.post('/add/:roomID', validateUser, addProject);

router.get('/getProjects/:roomID', validateUser, getProjects);

router.post('/addReview/:projectID', validateUser, addReviewToProject);

router.get('/getComments/:projectID', validateUser, getReviews);

router.get('/:projectId/review-status', validateUser, getReviewStatus);
router.put('/:projectID/update', validateUser, updateProject);

router.delete('/:projectID/delete', validateUser, deleteProject);

module.exports = router;