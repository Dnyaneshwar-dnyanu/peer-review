import { useRef, useState, useEffect } from "react";
import { FaHome, FaTasks, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoReloadSharp, IoEnterSharp } from "react-icons/io5";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import ConfirmModal from "../components/ConfirmModel";
import axios from "axios";


function StudentDashboard() {
  const navigate = useNavigate();
  const logoutBtn = useRef(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [deleteProject, setDeleteProject] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/getData`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();
      setUser(data.user);
    }

    setLoading(false);
  }

  const logout = async () => {
    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/logoutUser`, {
      method: "GET",
      credentials: "include"
    });

    let data = await res.json();

    if (!data.auth) {
      toast.info('Logged out successfully!')
      navigate('/login');
    }
  }

  const enterRoom = async () => {
    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/student/room/${roomCode}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      let data = await res.json();

      if (data.success) {
        navigate(`/student/room/${data.roomID}`);
      }
      else {
        toast.error(data.message);
      }
    }
  }

  const getDeleteButton = (projectID) => {
    return <ConfirmModal
      isOpen={true}
      title="Delete Project"
      message="Are you sure you want to delete this project? This action cannot be undone."
      onConfirm={() => handleDelete(projectID)}
      onCancel={() => setDeleteProject(false)}
    />
  }

  const handleDelete = async (projectID) => {
    const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/projects/${projectID}/delete`,
      { withCredentials: true }
    );

    if (res.status) {
      toast.success(res.data.message);
    }
    else {
      toast.error(res.data.message);
    }

    getUser();
    setDeleteProject(null);
  }


  if (loading)
    return <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
      <IoReloadSharp className="loader" />
    </div>

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black flex">
        {showModal && (
          <div className="fixed z-10 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/20 w-full max-w-md">

              <h2 className="text-2xl font-bold text-white mb-4">
                Enter Room Code
              </h2>

              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="
                w-full p-3 rounded-lg bg-white/20 placeholder-white/70 
                border border-white/30 focus:bg-white/30 outline-none
              "
              />

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30"
                >
                  Cancel
                </button>

                <button onClick={enterRoom}
                  className="py-2 px-4 rounded-lg bg-white text-indigo-900 font-semibold hover:bg-gray-200"
                >
                  Join Room
                </button>
              </div>

            </div>
          </div>
        )}

        <div className={`${showMenu ? "showMenu z-10" : "sidebar"} w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20`}>
          <h1 className="text-3xl font-bold tracking-wide text-white mb-20">
            Peer<span className="text-indigo-400">Review</span>
          </h1>

          <ul className="flex flex-col gap-6 text-white text-lg">
            <li>
              <Link className="flex items-center gap-3 hover:text-gray-200 cursor-pointer"
                onClick={() => setShowMenu(false)}
                to='/student/dashboard'>
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <a className="flex items-center gap-3 hover:text-gray-200 cursor-pointer"
                onClick={() => setShowMenu(false)}
                href='#projects'>
                <FaTasks /> Projects
              </a>
            </li>
          </ul>
          <span onClick={() => { setShowMenu(false) }} className="closeBar absolute top-3 right-2">
            <IoMdClose className="text-white text-3xl" />
          </span>
          <div ref={logoutBtn} onClick={logout} className="absolute left-8 bottom-8 flex items-center gap-3 text-xl text-red-200 hover:text-red-100 cursor-pointer">
            <FaSignOutAlt /> Logout
          </div>
        </div>

        <div className="flex-1 p-10 text-white relative">
          {/* Menu */}
          <IoMdMenu onClick={() => { setShowMenu(true) }} className="menuBar text-3xl " />
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-white/80 mb-10">Here’s your dashboard overview</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
            <div className="
            p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            hover:scale-[1.03] transition transform shadow-lg
          ">
              <h3 className="text-xl font-semibold">Total Projects</h3>
              <p className="text-4xl font-bold mt-4">{user.projects.length}</p>
            </div>
            <div
              onClick={() => setShowModal(true)}
              className="
              p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
              hover:scale-[1.03] transition transform shadow-lg relative
          ">
              <h3 className="text-xl font-semibold">Enter a Room</h3>
              <IoEnterSharp className="text-4xl font-bold mt-4" />
            </div>
          </div>

          <div className="border border-zinc-700"></div>

          <h2 id="projects" className="text-2xl font-semibold my-4">Your Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {
              user.projects.length === 0 ?
                <p className="p-4 text-zinc-500">You haven't added any project yet.</p>
                :
                user.projects.map((project) => {
                  return (
                    <div key={project._id} className="
                              p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                              hover:scale-[1.02] transition shadow-md relative
                            ">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      <p className="text-white/70 mt-2">
                        {project.description}
                      </p>
                      <p className="text-white/70 mt-2">
                        <span className="text-white/90">Marks:</span> {project.avgMarks}
                      </p>
                      <button onClick={() => setDeleteProject(project._id)} className="absolute top-4 right-2 text-xl text-red-400 hover:text-red-600 hover:scale-110 transition">
                        <MdDelete />
                      </button>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div >

      {
        deleteProject &&
        <ConfirmModal
          isOpen={deleteProject}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={() => handleDelete(deleteProject)}
          onCancel={() => setDeleteProject(null)}
        />
      }
    </>
  );
}

export default StudentDashboard;