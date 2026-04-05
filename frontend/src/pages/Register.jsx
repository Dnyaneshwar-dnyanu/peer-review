import api from '../api/axios';
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaIdCard, FaEnvelope, FaLock  } from "react-icons/fa";
import { toast } from 'react-toastify';

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

     const validateForm = () => {
          const { name, usn, email, role, password } = form;

          if (!name || name.trim().length < 4) {
               toast.error("Enter valid name");
               return false;
          }

          if (!role) {
               toast.error("Please select a role");
               return false;
          }

          if (role === 'student') {
               const usnRegex = /^1MS\d{2}[A-Z]{2}\d{3}$/;
               if (!usnRegex.test(usn.trim().toUpperCase())) {
                    toast.error("Please enter a valid USN (e.g., 1MS23CS063)");
                    return false;
               }
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
               toast.error("Please enter a valid email address");
               return false;
          }

          if (!password || password.trim().length < 4) {
               toast.error("Password must be at least 4 characters");
               return false;
          }

          return true;
     };

     const register = async () => {
          if (!validateForm()) return;

          const registrationData = {
               ...form,
               usn: form.role === 'student' ? form.usn.trim().toUpperCase() : undefined
          };

          try {
               setLoading(true);

               const res = await api.post(`/api/auth/register`, registrationData);

               const data = res.data;

               if (data.success) {
                    localStorage.setItem("token", data.token);
                    if (data.user.role === 'student') {
                         navigate('/student/dashboard');
                    }
                    else if (data.user.role === 'admin') {
                         navigate('/admin/dashboard');
                    }
                    toast.success("Successfully Registered!");
               }
          } catch (err) {
               const message = err.response?.data?.message || "Registration failed. Please try again.";
               toast.error(message);
          } finally {
               setLoading(false);
          }
     }

     return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4 py-10">
               <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl">
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white text-center mb-6">
                         Create Your Account
                    </h2>
                    <p className="text-center text-white/80 mb-8">
                         Join the Peer Review Platform
                    </p>

                    <form onSubmit={(e) => { e.preventDefault(); register(); }} className="flex flex-col gap-4 text-white">

                         {/* Full Name */}
                         <div className="relative">
                              <FaUser className="absolute left-3 top-3 text-white/70 text-lg" />
                              <input
                                   type="text"
                                   name="name"
                                   value={form.name}
                                   onChange={handleChange}
                                   required
                                   autoComplete="off"
                                   placeholder="Full Name"
                                   className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                 focus:bg-white/30 outline-none"
                              />
                         </div>

                         {/* Role */}
                         <div className="relative">
                              <select
                                   name="role"
                                   value={form.role}
                                   onChange={handleChange}
                                   required
                                   className="w-full p-3 rounded-lg bg-white/20 border border-white/30 
                 focus:bg-white/30 outline-none text-white"
                              >
                                   <option value="" disabled className="text-black">Select your role</option>
                                   <option value="student" className="text-black">Student</option>
                                   <option value="admin" className="text-black">Teacher</option>
                              </select>
                         </div>

                         {/* USN (only student) */}
                         {userRole === 'student' && (
                              <div className="relative">
                                   <FaIdCard className="absolute left-3 top-3 text-white/70 text-lg" />
                                   <input
                                        type="text"
                                        name="usn"
                                        value={form.usn}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        placeholder="USN (Ex: 1MS23CS063)"
                                        className="w-full p-3 pl-10 uppercase rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                   focus:bg-white/30 outline-none"
                                   />
                              </div>
                         )}

                         {/* Email */}
                         <div className="relative">
                              <FaEnvelope className="absolute left-3 top-3 text-white/70 text-lg" />
                              <input
                                   type="email"
                                   name="email"
                                   value={form.email}
                                   onChange={handleChange}
                                   required
                                   autoComplete="off"
                                   placeholder="Email"
                                   className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                 focus:bg-white/30 outline-none"
                              />
                         </div>

                         {/* Password */}
                         <div className="relative">
                              <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
                              <input
                                   type="password"
                                   name="password"
                                   value={form.password}
                                   onChange={handleChange}
                                   required
                                   autoComplete="off"
                                   placeholder="Password"
                                   className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                 focus:bg-white/30 outline-none"
                              />
                         </div>

                         {/* Button */}
                         <button
                              type="submit"
                              disabled={loading}
                              className={`w-full py-3 text-lg bg-white text-indigo-900 rounded-lg font-semibold 
               hover:bg-gray-200 transition ${loading && "cursor-disabled"}`}
                         >
                              {loading ? "Registering..." : "Register"}
                         </button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-white/80 mt-6">
                         Already have an account?{" "}
                         <Link to="/login" className="text-white font-semibold hover:underline">
                              Login
                         </Link>
                    </p>
               </div>
          </div>
     )
}

export default Register;
