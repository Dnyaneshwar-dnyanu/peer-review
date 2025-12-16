import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateRoom() {
     const navigate = useNavigate();
     const [form, setForm] = useState({
          roomName: "",
          semester: "",
          section: "",
          maxMarks: "",
     });

     const createRoom = async () => {
          const res = await fetch('http://localhost:3000/admin/createRoom', {
               method: 'POST',
               credentials: "include",
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(form)
          });

          if (res.status === 200) {
               toast.success("Classroom created successfully!")
               navigate('/admin/dashboard');
          }
     }

     const handleChange = (e) => {
          setForm({ ...form, [e.target.name]: e.target.value });
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 px-4">
               <div className="
        w-full max-w-lg p-10 rounded-2xl shadow-2xl
        bg-white/10 backdrop-blur-xl border border-white/20
        transform transition duration-500 hover:scale-[1.02]
      ">

                    <h1 className="text-3xl font-bold text-white text-center mb-6">
                         Create a Room
                    </h1>
                    <p className="text-center text-white/80 mb-8">
                         Set up a classroom for peer evaluation
                    </p>

                    <div className="flex flex-col gap-5 text-white">

                         <input
                              type="text"
                              name="roomName"
                              value={form.roomName}
                              onChange={handleChange}
                              autoComplete="off"
                              placeholder="Room Name (Ex: AI Lab, DBMS Section A)"
                              className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 
                       border border-white/30 focus:bg-white/30 outline-none"
                         />

                         <select
                              name="semester"
                              value={form.semester}
                              onChange={handleChange}
                              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:bg-white/30 outline-none"
                         >
                              <option value="" disabled>Select the semester</option>
                              <option value="I" className="text-black">I</option>
                              <option value="II" className="text-black">II</option>
                              <option value="III" className="text-black">III</option>
                              <option value="IV" className="text-black">IV</option>
                              <option value="V" className="text-black">V</option>
                              <option value="VI" className="text-black">VI</option>
                              <option value="VII" className="text-black">VII</option>
                              <option value="VIII" className="text-black">VIII</option>
                         </select>

                         <select
                              name="section"
                              value={form.section}
                              onChange={handleChange}
                              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:bg-white/30 outline-none"
                         >
                              <option value="" disabled>Select section</option>
                              <option value="A" className="text-black">A</option>
                              <option value="B" className="text-black">B</option>
                              <option value="C" className="text-black">C</option>
                              <option value="D" className="text-black">D</option>
                              <option value="E" className="text-black">E</option>
                         </select>

                         <input
                              type="number"
                              name="maxMarks"
                              value={form.maxMarks}
                              onChange={handleChange}
                              autoComplete="off"
                              placeholder="Maximum Marks"
                              className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 
                       border border-white/30 focus:bg-white/30 outline-none"
                         />

                         <button onClick={createRoom}
                              className="w-full py-3 mt-2 bg-white text-indigo-600 rounded-lg
                       font-semibold hover:bg-gray-200 transition"
                         >
                              Create Room
                         </button>

                    </div>
               </div>
          </div>
     );
}

export default CreateRoom;