import axios from 'axios';
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

function Register() {
     const navigate = useNavigate();
     const [form, setForm] = useState({ name: "", usn: "", email: "", role: "", password: "" });
     const [userRole, setUserRole] = useState('student');
     const [loading, setLoading] = useState(false);

     const handleChange = (e) => {
          setForm({ ...form, [e.target.name]: e.target.value });
          if (e.target.name === 'role') {
               setUserRole(e.target.value);
          }
     }

     function isValidEmail(email) {
          const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}/;
          return regex.test(email);
     }

     function isValidUSN(usn) {
          const regex = /^1MS\d{2}[A-Z]{2}\d{3}$/
          return regex.test(usn);
     }

     const register = async () => {

          form.usn = form.usn.toUpperCase();

          if (form.name.trim().length < 4 ||
               !isValidEmail(form.email) ||
               form.role.trim().length === 0 ||
               (form.role === 'student' && !isValidUSN(form.usn)) ||
               form.password.trim().length < 4) {

               return toast.error("Enter valid details");
          }

          try {
               setLoading(true);

               const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/register`,
                    form, { withCredentials: true }
               );

               const data = res.data;

               if (data.auth) {
                    if (data.user.role === 'student') {
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
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
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
                                   placeholder="USN ( Ex: 1MS23CS063 )"
                                   className="w-full p-3 uppercase rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
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
                              onClick={() => {
                                   register();
                              }}
                              className="w-full py-3 mt-2 text-lg bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition"
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