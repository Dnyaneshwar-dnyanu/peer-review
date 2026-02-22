import { useEffect, useState, useRef } from "react";
import { FaHome, FaUserGraduate, FaTasks, FaSignOutAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { toast } from "react-toastify";
import axios from "axios";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import Loader from "../components/Loader";

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
          try {
               setLoading(true);

               const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/getData`, {
                    withCredentials: true
               });

               if (res.status !== 200) throw new Error("Failed");
               setUser(res.data.user);

          } catch (err) {
               console.error(err);
               toast.error("Something error occurred!");

          } finally {
               setLoading(false);
          }
     }

     const getDisplayName = (name) => {
          let titles = ["dr", "mr", "mrs", "ms", "prof"];
          
          const parts = name.trim().split(" ");
          const first = parts[0].toLowerCase().replace(".", "");

          if (titles.includes(first)) {
               return parts[1] ? `${parts[0]} ${parts[1]}` : parts[0]; 
          }

          return parts[0];
     }

     const logout = async () => {
          try {
               setLoading(true);

               const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/logoutUser`, {
                    withCredentials: true
               });
     
               if (res.status !== 200) throw new Error("Failed");
     
               if (!res.data.auth) {
                    toast.info('Logged out successfully!');
                    navigate('/login');
               }

          } catch (err) {
               console.error(err);
               toast.error("Something error occurred!");

          } finally {
               setLoading(false);
          }
     }

     if (loading)
          return <Loader />

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
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user && getDisplayName(user.name)}!</h1>
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

                    <div className="border border-zinc-700"></div>

                    {/* Class Room Section */}
                    <h2 id="classRoom" className="text-2xl font-semibold my-4">Your Classrooms</h2>

                    <div className="p-4">
                         {
                              user.roomsCreated.length > 0 ? (
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {
                                             user.roomsCreated.map((room) =>
                                                  <RoomCard key={room._id} Room={room} onUpdate={() => getUser()} />
                                             )
                                        }
                                   </div>
                              ) : (
                                   <p className="text-zinc-500">You haven't created any classrooms</p>
                              )
                         }
                    </div>
               </div>
          </div>
     )
}

export default TeacherDashboard