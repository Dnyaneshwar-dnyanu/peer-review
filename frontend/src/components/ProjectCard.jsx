import { useNavigate, Link } from "react-router-dom";

function ProjectCard({ project, isAdmin, roomID, isActive, onSelectProject }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => onSelectProject(project)}
      className={`
        p-4 rounded-xl cursor-pointer transition
        border backdrop-blur-xl hover:scale-[1.02] hover:bg-white/30 hover:border-white hover:shadow-lg
        ${isActive
          ? "bg-white/30 border-white shadow-lg scale-[1.02]"
          : "bg-white/10 border-white/20 hover:bg-white/20"}
      `}
    >
      {/* Project Title */}
      <h3 className="text-white font-semibold text-lg">
        {project.title}
      </h3>
      <p className="text-white/80">
          {project.description}
      </p>

      {/* Student Info */}
      <p className="text-white/70 text-sm mt-1">
        {project.student.name} • {project.student.usn}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        {/* Submission Date */}
        <p className="text-white/60 text-xs">
          Submitted on {new Date(project.submittedAt).toLocaleDateString()}
        </p>
       
        <div className="absolute right-3 bottom-4 flex gap-2">
          {
            isAdmin &&
            <Link to={`/admin/room/${roomID}/project/${project._id}`} className=" px-2 py-1 bg-white text-indigo-500 font-semibold rounded-md hover:bg-gray-200 transition">View Info</Link>
          }
          <button onClick={() => onSelectProject(project)} className="px-2 py-1 bg-white text-indigo-500 font-semibold rounded-md hover:bg-gray-200 transition">Add Review</button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard