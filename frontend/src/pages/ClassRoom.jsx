import { useEffect, useState } from "react";
import { FaUserGraduate, FaProjectDiagram, FaPlus, FaUsers } from "react-icons/fa";
import { useParams } from "react-router-dom";

function ClassroomPage() {
  let roomId = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRoomData();
  }, []);

  let getRoomData = async () => {
    setLoading(true);
    let res = await fetch(`http://localhost:3000/admin/getRoomData/${roomId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 200) {
      setRoom(await res.json());
    }

    setLoading(false);
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 p-6">
      
      <div className="max-w-5xl mx-auto">
        
        {/* Room Header */}
        <div className="
          p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
          shadow-xl mb-10
        ">
          <h1 className="text-4xl font-bold text-white">{ room && room.roomName}</h1>

          <p className="text-white/80 mt-2">
            Semester: <span className="font-semibold">{ room && room.semester}</span> •  
            Section: <span className="font-semibold">{ room && room.section}</span>
          </p>

          <p className="text-white/80 mt-1">
            Max Marks: <span className="font-semibold">{ room && room.maxMarks}</span>
          </p>

          <p className="text-white/80 mt-1">
            Room Code:
            <span className="font-semibold ml-1">{ room && room.roomCode}</span>
          </p>

          <p className="text-white/80 mt-1">
            Status:
            <span
              className={`font-semibold ml-1 ${
                room && room.status === "OPEN" ? "text-green-300" : "text-red-300"
              }`}
            >
              { room && room.status}
            </span>
          </p>

          <div className="mt-5">
            <button className="px-5 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-200">
              Close Room
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Students Count */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer
          ">
            <FaUsers className="text-3xl text-white mb-3" />
            <h2 className="text-xl text-white font-semibold">Participants</h2>
            <p className="text-3xl font-bold text-white mt-2">
              { room && room.participants.length}
            </p>
          </div>

          {/* Projects Count */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer
          ">
            <FaProjectDiagram className="text-3xl text-white mb-3" />
            <h2 className="text-xl text-white font-semibold">Projects</h2>
            <p className="text-3xl font-bold text-white mt-2">
              { room && room.projects.length}
            </p>
          </div>

          {/* Add Project */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            shadow-md hover:scale-[1.03] transition cursor-pointer flex flex-col
            justify-center items-center
          ">
            <FaPlus className="text-3xl text-white mb-3" />
            <h2 className="text-xl text-white font-semibold">Add Project</h2>
          </div>
        </div>

        {/* Students List */}
        <h2 className="text-2xl text-white font-bold mb-4">Participants</h2>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          { room && room.participants.length === 0 ? (
            <p className="text-white/70">No students joined yet.</p>
          ) : (
            <ul className="space-y-3">
              { room && room.participants.map((student) => (
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

      </div>
    </div>
  );
}

export default ClassroomPage;