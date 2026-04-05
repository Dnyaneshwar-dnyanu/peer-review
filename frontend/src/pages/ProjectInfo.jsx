import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import EditProject from "../components/EditProject";
import ConfirmModal from "../components/ConfirmModel";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function ProjectInfo() {
    const navigate = useNavigate();
    const projectID = useParams().projectID;
    const roomID = useParams().roomID;
    const [project, setProject] = useState({});
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [deleteProject, setDeleteProject] = useState(false);

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const getProjectInfo = async () => {
            try {
                setLoading(true);

                // Fetch user role for permission checks
                const [authRes, res] = await Promise.all([
                    await api.get('/api/auth/validateUser'),
                    await api.get(`/api/projects/${projectID}/getInfo`)
                ]);

                if (authRes.data.auth) {
                    setUserRole(authRes.data.user.role);
                }

                if (res.status !== 200 || !res.data.project) {
                    navigate(`/admin/room/${roomID}`);
                }

                setProject(res.data.project);

            } catch (err) {
                const message = err.response?.data?.message || "Failed to fetch project details";
                toast.error(message);
                navigate(`/admin/room/${roomID}`);

            } finally {
                setLoading(false);
            }
        };

        getProjectInfo();
    }, [projectID, roomID, navigate]);

    const handleEdit = async (updatedData) => {
        if (!project?._id) return;

        try {
            setLoading(true);

            const res = await api.put(`/api/projects/${project._id}/update`,
                updatedData
            );

            if (res.data.success) {
                // Re-fetch project info
                const resInfo = await api.get(`/api/projects/${projectID}/getInfo`);
                setProject(resInfo.data.project);
                setEdit(false);
                toast.success(res.data.message);
            }

        } catch (err) {
            const message = err.response?.data?.message || "Something error occurred!";
            toast.error(message);

        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!project?._id) return;

        try {
            const res = await api.delete(`/api/projects/${project._id}/delete`);

            setDeleteProject(false);

            if (res.data.success) {
                toast.success(res.data.message);
                navigate(`/admin/room/${roomID}`);

            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            const message = err.response?.data?.message || "Something error occurred!";
            toast.error(message);

        } finally {
            setDeleteProject(false);
        }
    }

    if (loading)
        return <Loader />

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black md:p-8 p-6">

            <Link to={userRole === 'admin' ? `/admin/room/${roomID}` : `/student/room/${roomID}`} className="md:absolute relative sm:mb-0 mb-3 flex items-center gap-2 py-2 px-3 border border-white/10 bg-white/65 font-semibold rounded-md">
                <IoArrowBackOutline className="text-zinc-600" /> Go Back
            </Link>

            <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6 md:p-8 relative">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 capitalize">
                            {project?.title}
                        </h2>
                    </div>

                    {/* Permissions Check: Only Admin can Edit/Delete here */}
                    {userRole === 'admin' && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setEdit(true)}
                                className="
                                    px-4 py-2 rounded-lg
                                    bg-indigo-500/20 text-indigo-200
                                    border border-indigo-400/30
                                    hover:bg-indigo-500/30
                                    hover:scale-[1.03]
                                    transition-all duration-200
                                    font-semibold
                                    backdrop-blur-md
                                    "
                            >
                                ✏️ Edit
                            </button>

                            <button
                                onClick={() => setDeleteProject(true)}
                                className="
                                    px-4 py-2 rounded-lg
                                    bg-red-500/20 text-red-200
                                    border border-red-400/30
                                    hover:bg-red-500/30
                                    hover:scale-[1.03]
                                    transition-all duration-200
                                    font-semibold
                                    backdrop-blur-md
                                    "
                            >
                                🗑 Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <p className="text-white/80 leading-relaxed max-w-3xl text-lg">
                        {project?.description}
                    </p>

                    <div className="flex flex-wrap gap-3 my-5 text-sm">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                            👤 {project?.student?.name}
                        </span>

                        <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                            USN: {project?.student?.usn}
                        </span>

                        <span className="px-4 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                            📅 {new Date(project?.submittedAt).toLocaleDateString()}
                        </span>
                    </div>
                    {/* Teamates Info */}
                    {
                        project.type === "group" && project.members?.length > 0 && (
                            <div className="mt-3">
                                <p className="text-white/60 text-xs mb-2 uppercase tracking-wide">
                                    Team Members
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {project.members.map((member, index) => (
                                        <span
                                            key={member._id || index}
                                            className="
                                                flex items-center gap-2
                                                px-3 py-1 rounded-full
                                                bg-indigo-500/20 text-indigo-200
                                                border border-indigo-400/30
                                                text-xs font-medium
                                                transition hover:bg-indigo-500/30
                                            "
                                        >
                                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-400/30 text-[10px] font-bold">
                                                {member.name?.charAt(0)}
                                            </span>
                                            {member.usn}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>

                <div className="h-px bg-white/20 my-8" />

                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6">
                        Review Summary
                    </h3>

                    {project?.reviews && project?.reviews.length > 0 ? (
                        <div className="space-y-6">

                            <div className="flex items-center justify-between md:p-6 p-4 rounded-xl bg-green-500/10 border border-green-400/30">
                                <span className="text-white/80 text-lg">
                                    Average Marks
                                </span>
                                <span className="text-3xl font-bold text-green-300">
                                    {project.avgMarks}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {project.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="p-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white/70 text-sm">
                                                Reviewed by
                                            </span>
                                            <span className="text-indigo-300 font-semibold">
                                                {review.reviewerID.name}
                                            </span>
                                        </div>

                                        <p className="text-white/80 mb-2">
                                            <span className="font-semibold text-white">Marks:</span>{" "}
                                            {review.marks}
                                        </p>

                                        {review.comment && (
                                            <p className="text-white/70 leading-relaxed">
                                                <span className="font-semibold text-white">Feedback:</span>{" "}
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-400/30 text-yellow-200">
                            This project has not been reviewed yet.
                        </div>
                    )}
                </div>
            </div>

            {
                edit &&
                <EditProject
                    project={project}
                    onSave={async (updatedData) => {
                        handleEdit(updatedData)
                    }} />
            }

            {
                deleteProject &&
                <ConfirmModal
                    isOpen={deleteProject}
                    title="Delete Project"
                    message="Are you sure you want to delete this project? This action cannot be undone."
                    onConfirm={() => { handleDelete(); setDeleteProject(false); }}
                    onCancel={() => setDeleteProject(false)}
                />
            }
        </div>

    );
}

export default ProjectInfo;
