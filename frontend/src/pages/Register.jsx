import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
     const navigate = useNavigate();
     const [form, setForm] = useState({ name: "", usn: "", email: "", role: "", password: "" });
     const [userRole, setUserRole] = useState('student');

     const handleChange = (e) => {
          setForm({ ...form, [e.target.name]: e.target.value });
          if (e.target.name === 'role') {
               setUserRole(e.target.value);
          }
     }

     const register = async () => {
          let res = await fetch(`http://localhost:3000/api/auth/register`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               credentials: "include",
               body: JSON.stringify(form)
          });

          let data = await res.json();

          if (data.auth) {
               if(data.user.role === 'student') {
                    navigate('/student/dashboard');
               }
               else if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
               }
               toast.success("Successfully Registered!");
          }
          else {
               toast.error(data.message);
          }
     }


     return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 px-4">
               <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl">
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white text-center mb-6">
                         Create Your Account
                    </h2>
                    <p className="text-center text-white/80 mb-8">
                         Join the Peer Review Platform
                    </p>

                    <div className="flex flex-col gap-4 text-white">

                         <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              autoComplete='off'
                              placeholder="Full Name"
                              className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
                         />

                         <select
                              name="role"
                              value={form.role}
                              onChange={handleChange}
                              autoComplete='off'
                              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:bg-white/30 outline-none"
                         >
                              <option value="" disabled>Select your role</option>
                              <option value="student" className="text-black">Student</option>
                              <option value="admin" className="text-black">Teacher</option>
                         </select>

                         {
                              userRole === 'student' &&
                              <input
                                   type="text"
                                   name="usn"
                                   value={form.usn}
                                   onChange={handleChange}
                                   autoComplete='off'
                                   placeholder="USN"
                                   className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
                              />
                         }

                         <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              autoComplete='off'
                              placeholder="Email Address"
                              className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
                         />

                         <input
                              type="password"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              autoComplete='off'
                              placeholder="Password"
                              className="w-full p-3 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
                         />

                         <button
                              onClick={register}
                              className="w-full py-3 mt-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-200 transition"
                         >
                              Register
                         </button>

                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/80 mt-6">
                         Already have an account?{" "}
                         <a href="/login" className="text-white font-semibold hover:underline">
                              Login
                         </a>
                    </p>
               </div>
          </div>
     )
}

export default Register