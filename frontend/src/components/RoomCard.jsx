import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModel";
import axios from "axios";
import Loader from "./Loader";

function RoomCard({ Room, onUpdate }) {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(false);
     const [deleteRoom, setDeleteRoom] = useState(false);

     const handleDelete = async (RoomId) => {
          try {
               const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/admin/${RoomId}/delete`,
                    { withCredentials: true }
               );

               if (res.status === 200) {
                    toast.success(res.data.message);
               }
               else {
                    toast.error(res.data.message);
               }

               onUpdate();
               setDeleteRoom(false);

          } catch (err) {
               console.error(err);
               toast.error("Something error occurred!");

          }
     }

     return (
          <>
               <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:scale-[1.02] transition shadow-md">
                    <h3 className="text-xl font-bold mb-2 capitalize">{Room.roomName}</h3>

                    <p className="text-white/80 text-sm">
                         Semester: {Room.semester}
                    </p>

                    <p className="text-white/80 text-sm">
                         Section: {Room.section}
                    </p>

                    <p className="text-white/80 text-sm mt-1">
                         Max Marks: <span className="font-semibold">{Room.maxMarks}</span>
                    </p>

                    <p className="text-white/80 text-sm mt-1">
                         Status:{" "}
                         <span className={`font-semibold ${Room.status === 'OPEN' ? 'text-green-300' : 'text-red-300'}`}>
                              {Room.status}
                         </span>
                    </p>

                    <button onClick={() => setDeleteRoom(true)} className="absolute top-6 right-4 text-xl text-red-400 hover:text-red-600 hover:scale-110 transition">
                         <MdDelete />
                    </button>

                    <div className="flex items-center justify-between relative">
                         <button onClick={() => navigate(`/admin/room/${Room._id}`)} className="mt-4 bg-white text-indigo-900 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200">
                              View Classroom
                         </button>

                         <span className="text-[0.7rem] md:text-[0.8rem] text-zinc-400 absolute -bottom-4 md:-bottom-1 -right-3 md:right-0">
                              {Room.createdAt && new Date(Room.createdAt).toLocaleDateString()}
                         </span>
                    </div>
               </div>
               {
                    deleteRoom &&
                    <ConfirmModal
                         isOpen={deleteRoom}
                         title="Delete Classroom"
                         message="Are you sure you want to delete this classroom? This action cannot be undone."
                         onConfirm={() => handleDelete(Room._id)}
                         onCancel={() => setDeleteRoom(false)}
                    />
               }
          </>
     )
}

export default RoomCard