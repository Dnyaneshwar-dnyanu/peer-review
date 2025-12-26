import { useRef, useState, useEffect } from "react";
import { FaHome, FaTasks, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { IoReloadSharp } from "react-icons/io5";

function StudentDashboard() {
  const navigate = useNavigate();
  const logoutBtn = useRef(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState("")

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    let res = await fetch('http://localhost:3000/api/auth/getData', {
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
    const res = await fetch('http://localhost:3000/api/auth/logoutUser', {
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
    const res = await fetch(`http://localhost:3000/student/room/${roomCode}`, {
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

  if (loading) 
      return  <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
                <IoReloadSharp className="loader" />
              </div>

  return (
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

      <div className="w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20">
        <h2 className="text-2xl font-bold text-white mb-10">Peer Review</h2>

        <ul className="flex flex-col gap-6 text-white text-lg">
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <FaHome /> <Link to='/student/dashboard'>Home</Link>
          </li>
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <FaTasks /> <a href='#projects'>Projects</a>
          </li>
          <li ref={logoutBtn} onClick={logout} className="flex items-center gap-3 mt-10 text-red-200 hover:text-red-100 cursor-pointer">
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      <div className="flex-1 p-10 text-white relative">

        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-white/80 mb-10">Here’s your dashboard overview</p>
        <button onClick={() => setShowModal(true)}
            className="
              absolute right-10 top-10 px-4 py-2 text-lg bg-white text-indigo-900 rounded-lg font-semibold 
              hover:bg-gray-200 transition shadow-md
            "
          >
            Enter a Room
          </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            hover:scale-[1.03] transition transform shadow-lg
          ">
            <h3 className="text-xl font-semibold">Total Projects</h3>
            <p className="text-4xl font-bold mt-4">{user.projects.length}</p>
          </div>
        </div>

        <h2 id="projects" className="text-2xl font-semibold mb-4">Your Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {
            user.projects.length === 0 ?
              <p>You haven't added any project yet.</p>
              :
              user.projects.map((project, index) => {
                return <div key={index} className="
                        p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                        hover:scale-[1.02] transition shadow-md
                      ">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="text-white/70 mt-2">
                          {project.description}
                        </p>
                        <p className="text-white/70 mt-2">
                          Marks: {project.avgMarks}
                        </p>
                </div>
              })
          }
        </div>
      </div>
    </div >
  );
}

export default StudentDashboard;