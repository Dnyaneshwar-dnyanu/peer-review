import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";

function EvaluateForm({ project }) {
    const [form, setForm] = useState({ marks: 0, comment: "" });
    const [reviews, setReviews] = useState([]);
    const [ marks, setMarks ] = useState(project.avgMarks);

    useEffect(() => {
        if (project) {
            getComments();
        }

        let interval = setInterval(() => {
            if (project) {
                getComments();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [project]);

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

    const addReview = async () => {
        const res = await fetch(`http://localhost:3000/projects/addReview/${project._id}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (res.status === 200) {
            let data = await res.json();
            if (data.success) {
                toast.success(data.message);
            }
            else {
                toast.error(data.message);
            }
            getComments();
            setForm({ marks: 0, comment: "" });
        }
        else {
            toast.error("Error in adding review")
        }
    }

    const getComments = async () => {
        const res = await fetch(`http://localhost:3000/projects/getComments/${project._id}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (res.status === 200) {
            let data = await res.json();
            setReviews(data.reviews);
            setMarks(data.avgMarks);
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    return (
        <div className="
        p-8 rounded-md
        border border-white/20
        shadow-xl text-white
        h-full">
            {/* Header */}
            <div className="mb-6 flex justify-between">
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
                    <p className="text-white/70 mt-1">
                        {project.student.usn}
                    </p>
                    <p className="text-white/70 mt-1">
                        Marks: {marks}
                    </p>
                </div>
            </div>

            {/* Marks Input */}
            <div className="mb-4">
                <label className="block text-white/80 mb-1">
                    Marks
                </label>
                <input
                    type="number"
                    name="marks"
                    placeholder="Enter marks"
                    min={0}
                    max={10}
                    value={form.marks}
                    onChange={handleChange}
                    className="
            w-full p-3 rounded-lg
            bg-white/20 text-white
            placeholder-white/60
            border border-white/30
            focus:bg-white/30 outline-none
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
                className="
                    w-full py-3
                    bg-white text-indigo-900
                    rounded-lg font-semibold
                    hover:bg-gray-200
                    transition"
            >
                Submit Feedback
            </button>

            <div
                className="
                    mt-4 p-5 rounded-2xl
                    bg-zinc-800/20 backdrop-blur-xl
                    border border-white/20
                    text-white
                "
            >
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