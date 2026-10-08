const isUserIdMatch = (value, userId) => {
    if (!value || !userId) return false;
    return value.toString() === userId.toString();
};

const isProjectMember = (project, userId) => {
    if (!project || !userId) return false;
    const userIdStr = userId.toString();
    const studentId = project.student?._id || project.student;

    if (studentId && studentId.toString() === userIdStr) return true;

    if (Array.isArray(project.members)) {
        return project.members.some((member) => String(member.id) === userIdStr);
    }

    return false;
};

const canAccessRoom = (room, user) => {
    if (!room || !user) return false;

    if (user.role === 'admin') {
        return isUserIdMatch(room.createdBy, user._id);
    }

    const isParticipant = room.participants?.some((participant) => {
        const participantId = participant?._id || participant;
        if (!participantId) return false;
        return participantId.toString() === user._id.toString();
    });

    if (isParticipant) return true;

    return Array.isArray(room.projects) && room.projects.some((project) =>
        isProjectMember(project, user._id)
    );
};

module.exports = {
    isUserIdMatch,
    isProjectMember,
    canAccessRoom
};
