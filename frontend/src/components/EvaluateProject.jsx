import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import api from "../api/axios";

function EvaluateForm({ project, maxMarks }) {
    const [form, setForm] = useState({ marks: "", comment: "" });
    const [reviews, setReviews] = useState([]);
    const [marks, setMarks] = useState(project.avgMarks);
    const [viewType, setViewType] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reviewStatus, setReviewStatus] = useState(false);
    const [isProjectValid, setIsProjectValid] = useState(true);

    useEffect(() => {
        if (!project?._id || !isProjectValid) return;

        const getComments = async () => {
            try {
                const res = await api.get(`/api/projects/getComments/${project._id}`);
                setReviews(res.data.reviews);
                setMarks(res.data.avgMarks);
            } catch (err) {
                // Background polling - don't show toast unless it's a real failure
                if (err.response && isProjectValid) {
                    setIsProjectValid(false);
                    toast.error("Project no longer available");
                }
            }
        }

        const init = async () => {
            try {
                await Promise.all([
                    getComments(),
                    api.get(`/api/student/${project._id}/isUserProject`)
                        .then(res => setViewType(res.data.status ? "viewReview" : "addReview")),
                    api.get(`/api/projects/${project._id}/review-status`)
                        .then(res => setReviewStatus(res.data.status))
                ]);
            } catch (err) {
                console.error(err);
            }
        };

        init();

        let interval = setInterval(getComments, 5000); // 5s interval for production

        return () => clearInterval(interval);

    }, [project?._id, isProjectValid]);

    const addReview = async () => {
        if (form.marks === "" || form.marks === undefined) {
            return toast.error("Please enter marks");
        }

        if (parseInt(form.marks) < 0 || parseInt(form.marks) > maxMarks) {
            return toast.error(`Marks must be between 0 and ${maxMarks}`);
        }

        try {
            setLoading(true);
            const res = await api.post(`/api/projects/addReview/${project._id}`, form);

            if (res.data.success) {
                toast.success(res.data.message);
                setReviewStatus(true);
                // Refresh immediately
                const resComm = await api.get(`/api/projects/getComments/${project._id}`);
                setReviews(resComm.data.reviews);
                setMarks(resComm.data.avgMarks);
                setForm({ marks: "", comment: "" });
            }
        } catch (err) {
            const message = err.response?.data?.message || "Failed to submit feedback";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    if (!isProjectValid || !project?._id) {
        return (
            <div className="
                h-full flex items-center justify-center
                text-white/70 text-lg
                bg-white/10
                border border-white/20 rounded-md
                p-6
            ">
                Select a project to give the review ✨
            </div>
        );
    }

    return (
        <div className="
        md:p-8 p-4 rounded-md
        border border-white/20
        shadow-xl text-white
        h-full">
            {/* Header */}
            <div className="mb-6 flex md:flex-row flex-col justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-bold capitalize">
                        {project.title}
                    </h2>
                    <p className="text-white/70 mt-1">
                        {project.description}
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold capitalize">
                        {project.student.name}
                    </h2>
                    <div className="flex md:flex-col flex-row md:gap-0 gap-4">
                        <p className="text-white/70 mt-1">
                            {project.student.usn}
                        </p>
                        <p className="text-white/70 mt-1">
                            <span className="md:hidden inline-block mr-2"> • </span>Marks: {marks}
                        </p>
                    </div>
                </div>
            </div>

            {
                project.type === "group" && project.members?.length > 0 && (
                    <div className="mt-2 mb-6">
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
                                ">
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

            {(viewType === "addReview" && !reviewStatus) &&
                <form onSubmit={(e) => { e.preventDefault(); addReview(); }} className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">

                    {/* Marks Input */}
                    <div className="mb-4">
                        <label className="block text-white/80 mb-1">
                            Marks
                        </label>
                        <input
                            type="number"
                            name="marks"
                            placeholder="Enter marks"
                            autoFocus
                            required
                            value={form.marks}
                            onChange={(e) => {
                                const raw = e.target.value;

                                if (raw === "") {
                                    setForm({ ...form, marks: "" });
                                    return;
                                }

                                const numeric = Number(raw);

                                if (isNaN(numeric)) return;

                                const value = Math.min(maxMarks, Math.max(0, numeric));

                                setForm({ ...form, marks: value });
                            }}
                            className="
                                w-full p-3 rounded-xl
                                bg-white/10 text-white
                                placeholder-white/50
                                border border-white/20
                                focus:bg-white/20
                                focus:border-indigo-400
                                transition outline-none
                                "
                        />
                    </div>

                    {/* Feedback */}
                    <div className="mb-6">
                        <label className="block text-white/80 mb-1">
                            Feedback
                        </label>
                        <textarea
                            name="comment"
                            rows="4"
                            placeholder="Write feedback about the project"
                            onChange={handleChange}
                            value={form.comment}
                            className="
                        w-full p-3 rounded-lg
                        bg-white/20 text-white
                        placeholder-white/60
                        border border-white/30
                        focus:bg-white/30 outline-none
                        resize-none
                    "
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-3
                            bg-indigo-500 hover:bg-indigo-600
                            rounded-xl font-semibold
                            shadow-md
                            transition-all duration-200
                            hover:scale-[1.02]
                            ${loading && "cursor-disabled"}
                    `}>
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>
            }


            <div className="
                mt-6 p-6 rounded-2xl
                bg-white/5 backdrop-blur-lg
                border border-white/10
                shadow-inner
            ">

                <h3 className="text-xl font-semibold mb-4">Feedback</h3>
                {reviews.length === 0 ? (
                    <p className="text-white/70 italic">
                        No feedback added yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {reviews
                            .filter(review => review.comment && review.comment.trim().length > 0)
                            .map((review, index) => (
                                <div
                                    key={index}
                                    className="
                                    p-3 rounded-lg
                                    bg-white/20
                                    border border-white/20
                                "
                                >
                                    <p className="text-white/90">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                    </div>
                )}
            </div>

        </div>
    );
}

export default EvaluateForm;
