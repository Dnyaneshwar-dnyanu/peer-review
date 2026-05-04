import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaProjectDiagram, FaPlus, FaUsers } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import EvaluateProject from "../components/EvaluateProject";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdGetApp } from "react-icons/md";
import { MdOutlineSignalWifiStatusbarConnectedNoInternet4, MdOutlineSignalWifiStatusbar4Bar } from "react-icons/md";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

function ClassroomPage() {
  const navigate = useNavigate();
  let roomId = useParams().roomID;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closeRoomButton, setCloseRoomButton] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const getRoomData = async () => {
      try {
        const res = await api.get(`/api/admin/getRoomData/${roomId}`);

        const data = res.data;
        setRoom(data.room);
        setProjects(data.projects);
        setRoomCode(data.room.roomCode);

      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Logging out...");
          navigate('/login');
        } else {
          toast.error("Something error occurred!");
        }

      } finally {
        setLoading(false);
      }
    }

    getRoomData();

    let interval = setInterval(getRoomData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [roomId, navigate]);

  let openRoom = async () => {
    try {
      setCloseRoomButton(true);

      const res = await api.post(`/api/admin/openRoom/${roomId}`);

      if (res.status !== 200) throw new Error("Failed!");

      setRoomCode(res.data.code);
      // Trigger a refresh of room data
      const refreshData = async () => {
        const resData = await api.get(`/api/admin/getRoomData/${roomId}`);
        setRoom(resData.data.room);
        setProjects(resData.data.projects);
      }
      refreshData();

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

      const res = await api.post(`/api/admin/closeRoom/${roomId}`);

      if (res.status !== 200) throw new Error("Failed!");

      setRoomCode(res.data.code);
      // Trigger a refresh of room data
      const refreshData = async () => {
        const resData = await api.get(`/api/admin/getRoomData/${roomId}`);
        setRoom(resData.data.room);
        setProjects(resData.data.projects);
      }
      refreshData();

    } catch (err) {
      console.error(err);
      toast.error("Something error occurred!");

    } finally {
      setCloseRoomButton(false);
    }
  }

  let downloadExcel = async () => {
    try {
      const res = await api.get(`/api/admin/export/${roomId}`, {
        responseType: 'blob',
        withCredentials: true
      });

      // 🔥 Create download
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // optional: dynamic filename from backend
      const contentDisposition = res.headers['content-disposition'];
      let fileName = "evaluation.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");

    } catch (err) {
      const message = err.response?.data?.message || "Download failed. Please try again.";
      toast.error(message);
    }
  };

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
                    {closeRoomButton ? "Clossing Classroom..." : "Close Classroom"}
                  </button>
                  :
                  <button
                    onClick={openRoom}
                    disabled={closeRoomButton}
                    className="px-5 py-2 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 hover:scale-[1.03] cursor-pointer">
                    {closeRoomButton ? "Opening Classroom..." : "Open Classroom"}
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
              <button
                onClick={downloadExcel}
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
                Get Excel File
              </button>
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