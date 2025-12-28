import { useEffect, useState, useRef } from "react";
import { FaHome, FaUserGraduate, FaTasks, FaSignOutAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { toast } from "react-toastify";
import { IoReloadSharp } from "react-icons/io5";
import { IoMdMenu, IoMdClose } from "react-icons/io";

function TeacherDashboard() {
     const navigate = useNavigate();
     const logoutBtn = useRef(null);
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [showMenu, setShowMenu] = useState(false);

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
               toast.info('Logged out successfully!');
               navigate('/login');
          }
     }

     if (loading)
          return <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
               <IoReloadSharp className="loader" />
          </div>

     return (
          <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-zinc-900 to-black flex'>
               {/* Sidebar */}
               <div className={`${showMenu ? "showMenu z-10" : "sidebar"} w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20`}>
                    <h1 className="text-3xl font-bold tracking-wide text-white mb-20">
                         Peer<span className="text-indigo-400">Review</span>
                    </h1>

                    <ul className="flex flex-col gap-6 text-white text-lg">
                         <li>
                              <Link className="flex items-center gap-3 hover:text-gray-200 cursor-pointer"
                                   onClick={() => setShowMenu(false)}
                                   to='/admin/dashboard'>
                                   <FaHome /> Home
                              </Link>
                         </li>
                         <li>
                              <a className="flex items-center gap-3 hover:text-gray-200 cursor-pointer"
                                   onClick={() => setShowMenu(false)}
                                   href='#classRoom'>
                                   <FaTasks /> Classrooms
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
               {/* Main Content */}
               <div className="flex-1 p-10 text-white relative">

                    <IoMdMenu onClick={() => { setShowMenu(true) }} className="menuBar text-3xl " />

                    {/* Greeting Section */}
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user && user.name.split(' ')[0]}!</h1>
                    <p className="text-white/80 mb-10">Here’s your dashboard overview</p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">

                         <div className="
                              p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                              hover:scale-[1.03] transition transform shadow-lg
                         ">
                              <h3 className="text-xl font-semibold">Total Class Rooms</h3>
                              <p className="text-4xl font-bold mt-4">{user && user.roomsCreated.length}</p>
                         </div>

                         <div className="
                              p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                              hover:scale-[1.03] transition transform shadow-lg cursor-pointer
                         ">
                              <Link to='/admin/createRoom'>
                                   <h3 className="text-xl font-semibold">Create Classroom</h3>
                                   <IoMdAdd className="text-4xl font-bold mt-4" />
                              </Link>
                         </div>
                    </div>

                    {/* Class Room Section */}
                    <h2 className="text-2xl font-semibold mb-4">Your Class Rooms</h2>

                    <div id="classRoom" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {
                              user && user.roomsCreated.map((room) =>
                                   <RoomCard key={room._id} Room={room} />
                              )
                         }
                    </div>
               </div>
          </div>
     )
}

export default TeacherDashboard