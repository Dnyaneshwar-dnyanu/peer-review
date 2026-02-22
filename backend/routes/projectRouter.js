const express = require('express');
const router = express();
const projectModel = require('../models/Projects');
const userModel = require('../models/User');
const roomModel = require('../models/Room');
const reviewModel = require('../models/Reviews');
const { validateUser } = require('../middleware/validateUser');

router.get('/:projectID/getInfo', validateUser, async (req, res) => {
    let project = await projectModel.findOne({ _id: req.params.projectID })
        .populate({
            path: 'student',
            select: 'name usn'
        })
        .populate({
            path: 'reviews',
            populate: {
                path: 'reviewerID',
                select: 'name usn'
            }
        });
    res.send({ success: true, project: project });
});

router.post('/add/:roomID', validateUser, async (req, res) => {
    let { title, description } = req.body;

    let projectCreated = await projectModel.create({
        title,
        description,
        student: req.user._id
    });

    let room = await roomModel.findOne({ _id: req.params.roomID });
    room.projects.push(projectCreated._id);
    await room.save();

    let user = await userModel.findOne({ _id: req.user._id });
    user.projects.push(projectCreated._id);
    await user.save();

    res.send(projectCreated);
});

router.get('/getProjects/:roomID', validateUser, async (req, res) => {
    let room = await roomModel
        .findOne({ _id: req.params.roomID })
        .populate('projects')
        .populate('projects.student');

    res.send({ projects: room.projects });
});

router.post('/addReview/:projectID', validateUser, async (req, res) => {
    let user = await userModel.findOne({ _id: req.user._id });
    let isOwnProject = user.projects.some(
        project => project.toString() === req.params.projectID.toString()
    )

    if (isOwnProject) {
        return res.send({ success: false, message: "For your project you can't give the review" });
    }

    let project = await projectModel.findOne({ _id: req.params.projectID });
    let isItSecondTime = await reviewModel.findOne({ reviewerID: req.user._id, projectID: project._id });
    if (isItSecondTime) {
        return res.send({ success: false, message: "Only once you can submit the feedback" });
    }

    let { marks, comment } = req.body;
    let reviewAdded = await reviewModel.create({
        projectID: req.params.projectID,
        reviewerID: req.user._id,
        marks,
        comment
    });

    project.reviews.push(reviewAdded._id);
    if (project.avgMarks == 0) {
        project.avgMarks = parseInt(marks);
    } else {
        project.avgMarks = (project.avgMarks + parseInt(marks)) / 2;
    }
    await project.save();

    res.send({ success: true, message: "Review added successfully!" });
});

router.get('/getComments/:projectID', validateUser, async (req, res) => {
    let project = await projectModel.findOne({ _id: req.params.projectID }).populate('reviews');
    res.send({ success: true, avgMarks: project.avgMarks, reviews: project.reviews });
});


router.put('/:projectID/update', async (req, res) => {
    let { title, description } = req.body;

    let project = await projectModel.findOneAndUpdate(
        { _id: req.params.projectID }, 
        { $set: { title: title, description: description } }
    );

    if (!project) {
        return res.status(400).send({ success: false, message: "Failed to  update project details!" });
    }

    res.send({ success: true, message: "Project details update successfully!" });
});

router.delete('/:projectID/delete', validateUser, async (req, res) => {
    try {

        let project = await projectModel.findById({ _id: req.params.projectID }).populate("reviews");
        let user = await userModel.findById({ _id: project.student });

        if (!project) {
            return res.status(400).send({ success: false, message: "Failed to delete project!" });
        }

        user.projects = user.projects.filter(pId => pId.toString() != project._id.toString());
        await user.save();


        await reviewModel.deleteMany({
            _id: { $in: project.reviews.map(r => r._id) }
        });

        await projectModel.deleteOne({ _id: project._id });

        res.send({ success: true, message: "Successfully Deleted Project!" });

    } catch (err) {
        console.error(err);
        res.status(400).send({ success: false, message: "Failed to delete the project" });
    }
});

module.exports = router;