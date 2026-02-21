import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModel";
import axios from "axios";

function RoomCard({ Room, onUpdate }) {
     const navigate = useNavigate();

     const [deleteRoom, setDeleteRoom] = useState(false);

     const handleDelete = async (RoomId) => {
          const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/admin/${RoomId}/delete`, 
               { withCredentials: true }
          );

          if (res.status) {
               toast.success(res.data.message);
          }
          else {
               toast.error(res.data.message);
          }

          onUpdate();
          setDeleteRoom(false);
     }

     return (
          <>
               <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:scale-[1.02] transition shadow-md">
                    <h3 className="text-xl font-bold mb-2">{Room.roomName}</h3>

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

                    <button onClick={() => navigate(`/admin/room/${Room._id}`)} className="mt-4 bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">
                         View Classroom
                    </button>
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