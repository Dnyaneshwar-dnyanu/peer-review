const userModel = require('../models/User');

module.exports.isUserProject = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        let status = user.projects.some(
            pId => pId.toString() == req.params.projectID
        );
        res.send({ status });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
}