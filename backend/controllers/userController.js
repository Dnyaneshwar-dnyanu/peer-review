const userModel = require('../models/User');
const logger = require('../utils/logger');

module.exports.isUserProject = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        let status = user.projects.some(
            pId => pId.toString() == req.params.projectID
        );
        res.send({ status });
    } catch (err) {
        logger.error("user.is-project.error", { error: err.message, stack: err.stack, requestId: req.id, userId: req.user?._id ? String(req.user._id) : null });
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
}