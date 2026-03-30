import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { toast } from "react-toastify";

function ProjectCard({ project, isAdmin, roomID, isActive, onSelectProject }) {

  const [viewType, setViewType] = useState(null);

  useEffect(() => {
    const isItUsersProject = async () => {
      try {
        const res = await api.get(`/api/student/${project._id}/isUserProject`);

        if (res.status !== 200) throw new Error("Failed");

        setViewType(res.data.status ? "viewReview" : "addReview");

      } catch (err) {
        console.error(err);
        toast.error("Something error occurred!");
      }
    }
    isItUsersProject();
  }, [project._id]);

  return (
    <div
      className={`
        relative p-5 rounded-2xl cursor-pointer transition-all duration-300
        backdrop-blur-xl border
        ${isActive
          ? "bg-[#1d1d1d] border-white shadow-xl scale-[1.02]"
          : "bg-[#464646] border-white/10 hover:bg-[#353434] hover:border-white/30 hover:scale-[1.02]"}
      `}
    >
      {/* Project Title */}
      <h3 className="text-white text-lg font-semibold capitalize tracking-wide">
        {project.title}
      </h3>
      {/* Project Description */}
      <p className="text-white/60 text-sm mt-1 line-clamp-2">
        {project.description}
      </p>

      {/* Student Info */}
      <p className="text-indigo-300 text-xs mt-3 font-medium">
        👤 {project.student.name} • {project.student.usn}
      </p>

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

      {/* Footer */}
      <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">

        <p className="text-white/40 text-xs">
          {new Date(project.submittedAt).toLocaleDateString()}
        </p>

        <div className="flex gap-2">
          {isAdmin && (
            <Link
              to={`/admin/room/${roomID}/project/${project._id}`}
              className="
                px-3 py-1 text-xs
                bg-indigo-500/20 text-indigo-200
                border border-indigo-400/30
                rounded-md
                hover:bg-indigo-500/30
                transition
              "
            >
              View Info
            </Link>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(project);
            }}
            className="
              px-3 py-1 text-xs
              bg-white/10 text-white/80
              border border-white/20
              rounded-md
              hover:bg-white/20
              transition
            "
          >
            <HashLink to="#review" smooth>
              {viewType === "viewReview" ? "View Review" : "Add Review"}
            </HashLink>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard