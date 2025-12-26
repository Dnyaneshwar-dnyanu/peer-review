import { useEffect, useState } from "react";
import { FaProjectDiagram, FaPlus, FaUsers } from "react-icons/fa";
import { useParams } from "react-router-dom";
import ProjectCard from "../components/projectCard";
import EvaluateProject from "../components/EvaluateProject";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdGetApp } from "react-icons/md";
import { MdOutlineSignalWifiStatusbarConnectedNoInternet4, MdOutlineSignalWifiStatusbar4Bar } from "react-icons/md";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { IoReloadSharp } from "react-icons/io5";

function ClassroomPage() {
  let roomId = useParams().roomID;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    getRoomData();

    let interval = setInterval(getRoomData, 5000);

    return () => clearInterval(interval);
  }, []);

  let getRoomData = async () => {
    let res = await fetch(`http://localhost:3000/admin/getRoomData/${roomId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();
      setRoom(data.room);
      setProjects(data.projects);
      setRoomCode(data.room.roomCode);
    }

    setLoading(false);
  }

  let openRoom = async () => {
    setLoading(true);

    let res = await fetch(`http://localhost:3000/admin/openRoom/${roomId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();
      setRoomCode(data.code);
    }
  }

  let closeRoom = async () => {
    setLoading(true);
    let res = await fetch(`http://localhost:3000/admin/closeRoom/${roomId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();
      setRoomCode(data.code);
    }
  }

  if (loading) 
    return  <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
              <IoReloadSharp className="loader" />
            </div>

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black p-6 relative">
        <Link to='/admin/dashboard' className="absolute flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Back to Home</Link>
        <div className="max-w-5xl mx-auto">

          {/* Room Header */}
          <div className="
          p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
          shadow-xl mb-5
        ">
            <h1 className="text-4xl font-bold text-white">{room && room.roomName}</h1>

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
                  <button onClick={closeRoom} className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 cursor-pointer">
                    Close Room
                  </button>
                  :
                  <button onClick={openRoom} className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 hover:scale-[1.03] cursor-pointer">
                    Open Room
                  </button>
              }
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-7">

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
                    px-5 py-3 rounded-lg
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
        <div className="max-h-[90vh] w-full flex justify-between gap-4 p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="w-[40%]">
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
                <div id="participants" className="max-h-[94%] overflow-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
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
          <div className="px-[1px] bg-white/30"></div>
          <div className="w-[60%]">
            <h2 className="text-2xl text-white text-center font-bold mb-4">Evaluate the project</h2>
            <div className="bg-[#3c3c3c] rounded-md max-h-[94%] overflow-auto">
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
    </>
  );
}

export default ClassroomPage;