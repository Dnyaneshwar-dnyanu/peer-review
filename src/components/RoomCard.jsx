import { useNavigate  } from "react-router-dom"

function RoomCard({ Room }) {
     const navigate = useNavigate();
     
     return (
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

                    <button onClick={() => navigate(`/admin/room/${Room._id}`)} className="mt-4 bg-white text-indigo-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">
                         View Classroom
                    </button>
          </div>
     )
}

export default RoomCard