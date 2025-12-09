import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    let res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    let data = await res.json();
    
    if (data.auth) {
      if (data.user.role === 'student') {
        window.location.href = '/students/dashboard';
      }
      else if(data.user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      }
      else {
        window.location.href = '/';
      }
    }
    else {
      console.log(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 px-4">
      {/* Animated Login Card */}
      <div className="
        w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl 
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
        <div className="flex flex-col gap-5 text-white">

          {/* Email Input with Icon */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-white/70 text-lg" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
              placeholder="Password"
              className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            className="w-full py-3 mt-2 bg-white text-indigo-600 rounded-lg font-semibold 
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