import { useEffect, useState, useRef } from "react";
import { FaHome, FaUserGraduate, FaTasks, FaSignOutAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { toast } from "react-toastify";

function TeacherDashboard() {
     const navigate = useNavigate();
     const logoutBtn = useRef(null);
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

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
               toast.info('Logged out successfully!');
               navigate('/login');
          }
     }

     if (loading) return <p>Loading...</p>

     return (
          <div className='min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 flex'>
               {/* Sidebar */}
               <div className="w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-10">Peer Review</h2>

                    <ul className="flex flex-col gap-6 text-white text-lg">
                         <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
                              <FaHome /> Home
                         </li>
                         <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
                              <FaTasks /> Class Rooms
                         </li>
                         <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
                              <FaUserGraduate /> Profile
                         </li>
                         <li ref={logoutBtn} onClick={logout} className="flex items-center gap-3 mt-10 text-red-200 hover:text-red-100 cursor-pointer">
                              <FaSignOutAlt /> Logout
                         </li>
                    </ul>
               </div>
               {/* Main Content */}
               <div className="flex-1 p-10 text-white relative">
                    <Link to='/admin/createRoom' className="absolute right-2 top-2 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md text-zinc-800 hover:scale-[1.03] transition">
                         <IoMdAdd className="font-bold" />
                         Create Classroom
                    </Link>

                    {/* Greeting Section */}
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user && user.name.split(' ')[0]}!</h1>
                    <p className="text-white/80 mb-10">Here’s your dashboard overview</p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                         {/* Card 1 */}
                         <div className="
                              p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
                              hover:scale-[1.03] transition transform shadow-lg
                         ">
                              <h3 className="text-xl font-semibold">Total Class Rooms</h3>
                              <p className="text-4xl font-bold mt-4">{user && user.roomsCreated.length}</p>
                         </div>

                    </div>

                    {/* Class Room Section */}
                    <h2 className="text-2xl font-semibold mb-4">Your Class Rooms</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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