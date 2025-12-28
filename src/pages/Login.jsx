import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    let res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    let data = await res.json();

    if (data.auth) {
      if (data.user.role === 'student') {
        navigate('/student/dashboard');
      }
      else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
      else {
        navigate('/login');
      }
      toast.success("logged in successfully!");
    }
    else {
      toast.error(data.message);
      setForm({ email: "", password: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
      {/* Animated Login Card */}
      <div className="
        w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-2xl 
        bg-white/10 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl
      ">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-white/80 mb-8">
          Login to your Peer Review Account
        </p>

        {/* Form */}
        <div className="flex flex-col gap-4 text-white">

          {/* Email Input with Icon */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-white/70 text-lg" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Email"
              className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
            />
          </div>

          {/* Password Input with Icon */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Password"
              className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
            />
          </div>

          <Link to="/login/forgotpassword" className="text-end hover:underline">Forgot password?</Link>

          {/* Login Button */}
          <button
            onClick={login}
            className="w-full py-3 text-lg bg-white text-indigo-900 rounded-lg font-semibold 
                       hover:bg-gray-200 transition"
          >
            Login
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="text-white font-semibold hover:underline">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}

export default Login;