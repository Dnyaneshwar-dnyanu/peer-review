import React, { useState } from "react";
import { Link } from "react-router-dom";

function EditProject({ project, onSave }) {
  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed z-10 top-0 min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900/70 via-zinc-900/70 to-black/70 md:p-8 ">

      {/* Main Card */}
      <div className="max-w-4xl w-xl md:w-3xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
        
        <h2 className="text-3xl font-bold text-white mb-6">
          Edit Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-white/80 mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="
                w-full p-3 rounded-xl
                bg-white/10 text-white
                placeholder-white/50
                border border-white/20
                focus:bg-white/20
                focus:border-indigo-400
                outline-none
                transition
              "
              placeholder="Enter project title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 mb-2">
              Project Description
            </label>
            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              className="
                w-full p-3 rounded-xl
                bg-white/10 text-white
                placeholder-white/50
                border border-white/20
                focus:bg-white/20
                focus:border-indigo-400
                outline-none
                resize-none
                transition
              "
              placeholder="Enter project description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">

            <Link
              to={-1}
              className="
                px-5 py-2.5 rounded-lg
                bg-white/10 text-white/80
                border border-white/20
                hover:bg-white/20
                transition
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="
                px-6 py-2.5 rounded-lg
                bg-indigo-500/20 text-indigo-200
                border border-indigo-400/30
                hover:bg-indigo-500/30
                hover:scale-[1.03]
                transition-all duration-200
                font-semibold
              "
            >
              Save Changes
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProject;