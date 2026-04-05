const projectModel = require('../models/Projects');
const userModel = require('../models/User');
const roomModel = require('../models/Room');
const reviewModel = require('../models/Reviews');   

module.exports.getProjectInfo = async (req, res) => {
    try {
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
        
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        
        res.status(200).json({ success: true, project: project });
    } catch (err) {
        console.error("Unexpected Get Project Info Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.addProject = async (req, res) => {
    try {
        let { title, description, type, members } = req.body;

        if (!title || title.trim().length <= 3) {
            return res.status(400).json({ success: false, message: "Invalid project title" });
        }

        let projectCreated;
        if (type === "individual") {
            projectCreated = await projectModel.create({
                title,
                description,
                type,
                student: req.user._id
            });

        } else {
            projectCreated = await projectModel.create({
                title,
                description,
                type,
                members,
                student: req.user._id
            });

            await Promise.all(members.map(async member => {
                let user = await userModel.findOne({ _id: member.id });
                if (user) {
                    user.projects.push(projectCreated._id);
                    await user.save();
                }
            }));
        }

        let user = await userModel.findOne({ _id: req.user._id });
        user.projects.push(projectCreated._id);
        await user.save();

        let room = await roomModel.findOne({ _id: req.params.roomID });
        if (room) {
            room.projects.push(projectCreated._id);
            await room.save();
        }

        res.status(201).json({ success: true, project: projectCreated });
    } catch (err) {
        console.error("Unexpected Add Project Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.getProjects = async (req, res) => {
    try {
        let room = await roomModel
            .findOne({ _id: req.params.roomID })
            .populate('projects')
            .populate('projects.student');

        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        res.status(200).json({ success: true, projects: room.projects });
    } catch (err) {
        console.error("Unexpected Get Projects Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.addReviewToProject = async (req, res) => {
    try {
        let user = await userModel.findOne({ _id: req.user._id });
        let isOwnProject = user.projects.some(
            project => project.toString() === req.params.projectID.toString()
        )

        if (isOwnProject) {
            return res.status(400).json({ success: false, message: "You cannot review your own project" });
        }

        let project = await projectModel.findOne({ _id: req.params.projectID });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        let isItSecondTime = await reviewModel.findOne({ reviewerID: req.user._id, projectID: project._id });
        if (isItSecondTime) {
            return res.status(400).json({ success: false, message: "You have already submitted feedback" });
        }

        let { marks, comment } = req.body;
        if (marks === undefined || marks === null) {
            return res.status(400).json({ success: false, message: "Marks are required" });
        }

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

        res.status(200).json({ success: true, message: "Review added successfully!" });
    } catch (err) {
        console.error("Unexpected Add Review Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.getReviews = async (req, res) => {
    try {
        let project = await projectModel.findOne({ _id: req.params.projectID }).populate('reviews');
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.status(200).json({ success: true, avgMarks: project.avgMarks, reviews: project.reviews });
    } catch (err) {
        console.error("Unexpected Get Reviews Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.getReviewStatus = async (req, res) => {
    try {
        let projectId = req.params.projectId;
        const review = await reviewModel.findOne({
            projectID: projectId, reviewerID: req.user._id
        });
        res.status(200).json({ success: true, status: review ? true : false });
    } catch (err) {
        console.error("Unexpected Get Review Status Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.updateProject = async (req, res) => {
    try {
        let { title, description } = req.body;

        // Strict Admin Check
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin can update projects"
            });
        }

        let project = await projectModel.findOneAndUpdate(
            { _id: req.params.projectID },
            { $set: { title: title, description: description } },
            { new: true }
        );

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        res.status(200).json({ success: true, message: "Project details updated successfully!" });
    } catch (err) {
        console.error("Unexpected Update Project Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.deleteProject = async (req, res) => {
    try {
        let project = await projectModel.findById(req.params.projectID).populate("reviews");
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const room = await roomModel.findOne({ projects: project._id });

        // Business Rule Check for Students
        if (req.user.role === 'student' && room) {
            return res.status(403).json({
                success: false,
                message: "Project cannot be deleted while room is active"
            });
        }

        // Deletion access check (student can delete if not in room and they own it, or admin)
        if (req.user.role !== 'admin' && project.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // If in a room, remove reference (only reached if admin or if student AND not blocked above)
        if (room) {
            room.projects = room.projects.filter(pId => pId.toString() !== project._id.toString());
            await room.save();
        }

        let user = await userModel.findById(project.student);
        if (user) {
            user.projects = user.projects.filter(pId => pId.toString() !== project._id.toString());
            await user.save();
        }

        if (project.type === 'group') {
            await Promise.all(project.members.map(async m => {
                let member = await userModel.findById(m.id);
                if (member) {
                    member.projects = member.projects.filter(pId => pId.toString() !== project._id.toString());
                    await member.save();
                }
            }));
        }

        await reviewModel.deleteMany({
            _id: { $in: project.reviews.map(r => r._id) }
        });

        await projectModel.deleteOne({ _id: project._id });

        res.status(200).json({ success: true, message: "Successfully Deleted Project!" });

    } catch (err) {
        console.error("Unexpected Delete Project Error:", err);
        res.status(500).json({ success: false, message: "Failed to delete the project" });
    }
}
