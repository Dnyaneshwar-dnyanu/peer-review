import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify'
import ProjectCard from "../components/projectCard";
import EvaluateProject from "../components/EvaluateProject";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoReloadSharp } from "react-icons/io5";

function StudentRoom() {
     const roomID = useParams().roomID;
     const navigate = useNavigate();
     const [room, setRoom] = useState(null);
     const [loading, setLoading] = useState(true);
     const [form, setForm] = useState({ title: "", description: "" });
     const [projects, setProjects] = useState([]);
     const [selectedProject, setSelectedProject] = useState(null);

     useEffect(() => {
          getRoomData();

          let interval = setInterval(getRoomData, 5000);

          return () => clearInterval(interval);
     }, []);

     let getRoomData = async () => {
          let res = await fetch(`http://localhost:3000/admin/getRoomData/${roomID}`, {
               credentials: 'include'
          });

          if (res.status === 200) {
               let data = await res.json()
               
               if (data.room.status === 'CLOSED') {
                    navigate('/student/dashboard');
                    return;
               }
               setRoom(data.room);
               setProjects(data.projects);
          }

          setLoading(false);
     }

     let handleChange = (e) => {
          setForm({ ...form, [e.target.name]: e.target.value });
     }

     let submitProject = async () => {
          if (form.title.trim().length <= 3) {
               toast.error('Invalid details...');
               return;
          }

          let res = await fetch(`http://localhost:3000/projects/add/${roomID}`, {
               method: "POST",
               credentials: "include",
               headers: { 'Content-type': 'application/json' },
               body: JSON.stringify(form)
          });

          if (res.status === 200) {
               toast.success('Project added successfully!');
               setForm({ title: "", description: "" });
          }

          getRoomData();
     }

     if (loading) 
         return  <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
                   <IoReloadSharp className="loader" />
                 </div>

     return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black p-6 relative">
               <Link to='/student/dashboard' className="absolute flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Back to Home</Link>
               <div className="max-w-2xl mx-auto">
                    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl mb-10">
                         <h1 className="text-4xl font-bold text-white">{room.roomName}</h1>

                         <p className="text-white/80 mt-2">
                              Semester: <span className="font-semibold">{room.semester}</span> •
                              Section: <span className="font-semibold">{room.section}</span>
                         </p>

                         <p className="text-white/80 mt-1">
                              Max Marks: <span className="font-semibold">{room.maxMarks}</span>
                         </p>

                         <p className="text-white/80 mt-1">
                              Room Code:
                              <span className="font-semibold ml-1">{room.roomCode}</span>
                         </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl mb-10">
                         <h2 className="text-2xl text-white font-bold mb-6">Submit Your Project</h2>

                         <div className="flex flex-col items-center gap-2 px-15 text-white/80">
                              <input type="text" name="title" onChange={handleChange} autoComplete='off' placeholder="Project title" className="w-full border outline-none p-3 rounded-lg bg-white/20 border-white/30 placeholder-white/70 focus:bg-white/30" />
                              <textarea name="description" onChange={handleChange} placeholder="tell us about your project...." className="w-full border outline-none p-3 rounded-lg bg-white/20 border-white/30 placeholder-white/70 focus:bg-white/30"></textarea>
                              <button onClick={submitProject}
                                   className="w-full mt-6 px-6 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition">
                                   Submit Project
                              </button>
                         </div>

                    </div>
               </div>
               <div className="max-h-[95vh] w-full flex justify-between gap-4 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                    <div className="w-[40%]">
                         <h2 className="text-2xl text-white text-center font-bold mb-4">Projects</h2>

                         <div className="ProjectContainer max-h-[94%] overflow-auto p-4 flex flex-col gap-3 bg-white/20 rounded-md">
                              {projects.length === 0 ?
                                   <p className="text-white/70">Anyone haven't submitted any project yet.</p>
                                   :
                                   projects.map(project => {
                                        return <ProjectCard key={project._id} project={project} isAdmin={false} isActive={selectedProject?._id === project._id} onSelectProject={setSelectedProject} />
                                   })
                              }
                         </div>
                    </div>
                    <div className="px-[1px] bg-white/30"></div>
                    <div className="w-[60%]">
                         <h2 className="text-2xl text-white text-center font-bold mb-4">Evaluate the project</h2>
                         <div className="bg-white/20 rounded-md max-h-[94%] overflow-auto">
                              {
                                   !selectedProject ?
                                        <p className="text-white/70 p-4">Select the project to evaluate</p>
                                        :
                                        <EvaluateProject project={selectedProject} />
                              }
                         </div>
                    </div>
               </div>

          </div>

     );
}

export default StudentRoom;