import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify'
import ProjectCard from "../components/ProjectCard";
import EvaluateProject from "../components/EvaluateProject";
import AddProject from "../components/AddProject";
import Loader from "../components/Loader";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function StudentRoom() {
     const roomID = useParams().roomID;
     const navigate = useNavigate();
     const [room, setRoom] = useState(null);
     const [loading, setLoading] = useState(true);
     const [projects, setProjects] = useState(null);
     const [showForm, setShowForm] = useState(false);
     const [selectedProject, setSelectedProject] = useState(null);

     const refreshRoomData = async () => {
          try {
               const res = await api.get(`/api/admin/getRoomData/${roomID}`);

               const data = res.data;

               if (data.room.status === 'CLOSED') {
                    toast.info("Classroom Closed");
                    navigate('/student/dashboard');

               } else {
                    setRoom(data.room);
                    setProjects(data.projects);
               }

          } catch (err) {
               console.error(err);
               toast.error("Something error occurred!");
          }
     }

     useEffect(() => {
          const getRoomData = async () => {
               try {
                    const res = await api.get(`/api/admin/getRoomData/${roomID}`);

                    const data = res.data;

                    if (data.room.status === 'CLOSED') {
                         toast.info("Classroom Closed");
                         navigate('/student/dashboard');

                    } else {
                         setRoom(data.room);
                         setProjects(data.projects);
                    }

               } catch (err) {
                    console.error(err);
                    toast.error("Something error occurred!");

               } finally {
                    setLoading(false);
               }
          }

          getRoomData();

          let interval = setInterval(getRoomData, 5000);

          return () => clearInterval(interval);
     }, [roomID, navigate]);

     if (loading)
          return <Loader />

     return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black p-6 relative">
               <Link to={"/student/dashboard"} className="md:absolute relative md:mb-0 mb-4 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md">
                    <IoArrowBackOutline className="text-zinc-600" /> Back Home
               </Link>
               <div className="max-w-3xl mx-auto">
                    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl md:mb-10 mb-6">
                         <h1 className="text-4xl font-bold text-white capitalize">{room.roomName}</h1>

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

                    {!showForm &&
                         <button
                              onClick={() => setShowForm(true)}
                              className={`
                                   w-full px-6 py-3 mb-4 bg-white text-indigo-900 rounded-lg font-semibold 
                                   overflow-hidden hover:bg-gray-200 transition-all duration-1000 ease-in-out
                                   ${showForm ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100'}
                                   `}>
                                        Click to Add Project
                         </button>
                    }

                    <div className={`   
                              overflow-hidden
                              transition-all duration-500 ease-in-out
                              ${showForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} `}>
                         <AddProject onClose={() => {
                              setShowForm(false);
                              refreshRoomData();
                         }} />
                    </div>

               </div>
               <div className="md:max-h-[90vh] w-full flex md:flex-row flex-col justify-between gap-4 p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                    <div className="md:w-[40%]">
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
                    <div className="md:px-[1px] py-[1px] bg-white/30"></div>
                    <div id="review" className="md:w-[60%]">
                         <h2 className="text-2xl text-white text-center font-bold mb-4">Evaluate the project</h2>
                         <div className="bg-[#3c3c3c] rounded-md max-h-[94%] overflow-auto">
                              {
                                   !selectedProject ?
                                        <p className="text-white/70 p-4">Select the project to evaluate</p>
                                        :
                                        <EvaluateProject project={selectedProject} maxMarks={room.maxMarks} />
                              }
                         </div>
                    </div>
               </div>

          </div>

     );
}

export default StudentRoom;
