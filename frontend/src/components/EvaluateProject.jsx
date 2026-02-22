import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";

function EvaluateForm({ project, maxMarks }) {
    const [form, setForm] = useState({ marks: "", comment: "" });
    const [reviews, setReviews] = useState([]);
    const [marks, setMarks] = useState(project.avgMarks);
    const [viewType, setViewType] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project) {
            getComments();
            isItUsersProject();
        }

        let interval = setInterval(getComments, 3000);

        return () => clearInterval(interval);
    }, [project]);

    const addReview = async () => {
        if (parseInt(form.marks) < 5)
            return toast.error("Enter Valid Marks");

        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/projects/addReview/${project._id}`,
                form, { withCredentials: true }
            );

            const data = res.data;
            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }

            getComments();
            setForm({ marks: 0, comment: "" });

        } catch (err) {
            console.error(err);
            toast.error("Something error occurred!");
        } finally {
            setLoading(false);
        }
    }

    const getComments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/projects/getComments/${project._id}`, {
                withCredentials: true
            });

            if (res.status !== 200) throw new Error("Failed");

            setReviews(res.data.reviews);
            setMarks(res.data.avgMarks);

        } catch (err) {
            console.error(err);
            toast.error("Something error occurred!");
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const isItUsersProject = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/student/${project._id}/isUserProject`, {
                withCredentials: true
            });

            if (res.status !== 200) throw new Error("Failed");

            setViewType(res.data.status ? "viewReview" : "addReview");

        } catch (err) {
            console.error(err);
            toast.error("Something error occurred!");
        }
    }

    if (!project) {
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
            <div className="mb-8 flex md:flex-row flex-col justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
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

            {viewType === "addReview" &&
                <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">

                    {/* Marks Input */}
                    <div className="mb-4">
                        <label className="block text-white/80 mb-1">
                            Marks
                        </label>
                        <input
                            type="number"
                            name="marks"
                            placeholder="Enter marks"
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
                        onClick={addReview}
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
                </div>
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