import { useEffect, useState } from "react";
import axios from "axios";
import { FaProjectDiagram, FaPlus, FaUsers } from "react-icons/fa";
import { useParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import EvaluateProject from "../components/EvaluateProject";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdGetApp } from "react-icons/md";
import { MdOutlineSignalWifiStatusbarConnectedNoInternet4, MdOutlineSignalWifiStatusbar4Bar } from "react-icons/md";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { IoReloadSharp } from "react-icons/io5";
import Loader from "../components/Loader";

function ClassroomPage() {
  let roomId = useParams().roomID;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeRoomButton, setCloseRoomButton] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    getRoomData();

    let interval = setInterval(getRoomData, 3000);

    return () => clearInterval(interval);
  }, []);

  let getRoomData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/admin/getRoomData/${roomId}`, {
        withCredentials: true
      });

      const data = res.data;
      setRoom(data.room);
      setProjects(data.projects);
      setRoomCode(data.room.roomCode);

    } catch (err) {
      console.error(err);
      toast.error("Something error occurred!");

    } finally {
      setLoading(false);
    }
  }

  let openRoom = async () => {
    try {
      setCloseRoomButton(true);

      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/admin/openRoom/${roomId}`, {
        withCredentials: true
      });

      if (res.status !== 200) throw new Error("Failed!");

      setRoomCode(res.data.code);
      getRoomData();

    } catch (err) {
      console.error(err);
      toast.error("Something error occurred!");

    } finally {
      setCloseRoomButton(false);
    }
  }

  let closeRoom = async () => {
    try {
      setCloseRoomButton(true);

      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/admin/closeRoom/${roomId}`, {
        withCredentials: true
      });

      if (res.status !== 200) throw new Error("Failed!");

      setRoomCode(res.data.code);
      getRoomData();

    } catch (err) {
      console.error(err);
      toast.error("Something error occurred!");

    } finally {
      setCloseRoomButton(false);
    }
  }

  if (loading)
    return <Loader />

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black p-6 relative">
        <Link to='/admin/dashboard' className="md:absolute relative md:mb-0 mb-3 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Back to Home</Link>
        <div className="max-w-5xl mx-auto">

          {/* Room Header */}
          <div className="
          p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
          shadow-xl mb-5
        ">
            <h1 className="text-4xl font-bold text-white capitalize">{room && room.roomName}</h1>

            <p className="text-white/80 mt-2">
              Semester: <span className="font-semibold">{room && room.semester}</span> •
              Section: <span className="font-semibold">{room && room.section}</span>
            </p>

            <p className="text-white/80 mt-1">
              Max Marks: <span className="font-semibold">{room && room.maxMarks}</span>
            </p>

            <p className="text-white/80 mt-1">
              Room Code:
              <span className="font-semibold ml-1">{roomCode}</span>
            </p>

            <p className="text-white/80 mt-1">
              Status:
              <span
                className={`font-semibold ml-1 ${room && room.status === "OPEN" ? "text-green-300" : "text-red-300"
                  }`}
              >
                {room && room.status}
              </span>
            </p>

            <div className="mt-5">
              {
                room && room.status === "OPEN" ?
                  <button 
                    onClick={closeRoom} 
                    disabled={closeRoomButton}
                    className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 cursor-pointer">
                    {closeRoomButton ? "Clossing Classroom..." : "Close Classroom" }
                  </button>
                  :
                  <button 
                    onClick={openRoom} 
                    disabled={closeRoomButton}
                    className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 hover:scale-[1.03] cursor-pointer">
                      {closeRoomButton ? "Opening Classroom..." : "Open Classroom" }
                  </button>
              }
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-7">

            {/* Students Count */}
            <div className="
            p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer
          ">
              <HashLink smooth to="#participants" onClick={() => setShowProjects(false)}>
                <h2 className="text-xl text-white font-semibold flex gap-3"><FaUsers className="text-3xl text-white mb-3" /> Participants</h2>
                <p className="text-3xl font-bold text-white mt-2">
                  {room && room.participants.length}
                </p>
              </HashLink>
            </div>

            {/* Projects Count */}
            <div className="
            p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer
          ">
              <HashLink smooth to="#projects" onClick={() => setShowProjects(true)}>
                <h2 className="text-xl text-white font-semibold flex gap-3"><FaProjectDiagram className="text-3xl text-white mb-3" /> Projects</h2>
                <p className="text-3xl font-bold text-white mt-2">
                  {room && room.projects.length}
                </p>
              </HashLink>
            </div>
            {/* Class Room Status */}
            <div className="
            p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer
          ">
              <h2 className="text-xl text-white font-semibold flex gap-3">
                {
                  room.status === 'OPEN' ?
                    <MdOutlineSignalWifiStatusbar4Bar className="text-3xl text-white mb-3" />
                    :
                    <MdOutlineSignalWifiStatusbarConnectedNoInternet4 className="text-3xl text-white mb-3" />
                }
                Status
              </h2>
              <p className={`text-2xl font-semibold mt-2 ${room.status === 'OPEN' ? "text-green-300" : "text-red-300"}`}>
                {room.status}
              </p>
            </div>
            <div className="p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer">
              <h2 className="text-xl text-white font-semibold flex gap-3">
                <MdGetApp className="text-3xl text-white mb-3" /> Evaluation File
              </h2>
              <a
                href={`http://localhost:3000/admin/export/${roomId}`}
                className="
                    inline-flex items-center gap-2
                    md:px-5 md:py-3 p-2 rounded-lg
                    bg-indigo-500/20 text-indigo-300
                    border border-indigo-400/30
                    font-semibold
                    hover:bg-indigo-500/30
                    hover:text-white
                    transition
                    "
              >
                <span>📄</span>
                Get CSV File
              </a>
            </div>
          </div>
        </div>
        <div className="md:max-h-[90vh] w-full flex md:flex-row flex-col justify-between gap-4 p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="md:w-[40%]">
            <div className="header flex justify-around">
              <h2
                className={`text-2xl text-white font-bold mb-4 cursor-pointer ${showProjects ? "text-white/35 hover:text-white/60" : "text-white"}`}
                onClick={() => setShowProjects(false)}
              >
                Participants</h2>
              <h2
                className={`text-2xl font-bold mb-4 cursor-pointer ${showProjects ? "text-white" : "text-white/35 hover:text-white/60"}`}
                onClick={() => setShowProjects(true)}
              >
                Projects</h2>
            </div>
            {
              !showProjects ?
                <div id="participants" className="max-h-[94%] overflow-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:p-6 p-4">
                  {room && room.participants.length === 0 ? (
                    <p className="text-white/70">No students joined yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {room && room.participants.map((student) => (
                        <li
                          key={student._id}
                          className="p-3 bg-white/10 rounded-lg text-white border border-white/20 flex justify-between"
                        >
                          <span>{student.name}</span>
                          <span className="text-white/70">{student.usn}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                :
                <div id="projects" className="ProjectContainer max-h-[94%] overflow-auto p-4 flex flex-col gap-3 bg-white/20 rounded-md">
                  {projects.length === 0 ?
                    <p className="text-white/70">Anyone haven't submitted any project yet.</p>
                    :
                    projects.map(project => {
                      return <ProjectCard key={project._id} project={project} isAdmin={true} roomID={roomId} isActive={selectedProject?._id === project._id} onSelectProject={setSelectedProject} />
                    })
                  }
                </div>
            }
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
    </>
  );
}

export default ClassroomPage;