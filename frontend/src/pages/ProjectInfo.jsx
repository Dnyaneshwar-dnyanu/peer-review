import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

function ProjectInfo() {
    const projectID = useParams().projectID;
    const roomID = useParams().roomID;
    const [project, setProject] = useState({});

    useEffect(() => {
        getProjectInfo();

        let interval = setInterval(getProjectInfo, 5000);

        return () => clearInterval(interval);
    }, []);

    const getProjectInfo = async () => {
        const res = await fetch(`http://localhost:3000/projects/getInfo/${projectID}`, {
            credentials: "include",
        })

        if (res.status === 200) {
            let data = await res.json();
            setProject(data.project);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black p-8">
            <Link to={`/admin/room/${roomID}`} className="absolute flex items-center gap-2 py-2 px-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Go Back </Link>
            <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">

                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3">
                        {project.title}
                    </h2>

                    <p className="text-white/80 leading-relaxed max-w-3xl">
                        {project.description}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5 text-sm">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                            👤 {project.student?.name}
                        </span>

                        <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                            USN: {project.student?.usn}
                        </span>

                        <span className="px-4 py-1.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                            📅 {new Date(project.submittedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="h-px bg-white/20 my-8" />

                <div>
                    <h3 className="text-2xl font-semibold text-white mb-6">
                        Review Summary
                    </h3>

                    {project.reviews && project.reviews.length > 0 ? (
                        <div className="space-y-6">

                            <div className="flex items-center justify-between p-6 rounded-xl bg-green-500/10 border border-green-400/30">
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
        </div>

    );
}

export default ProjectInfo;
