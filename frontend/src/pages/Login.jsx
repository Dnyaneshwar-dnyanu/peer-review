import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api/axios";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const login = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await api.post(`/api/auth/login`, form);

      const data = res.data;

      if (data.auth) {
        localStorage.setItem("token", data.token);
        if (data.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        }
        toast.success("Welcome back!");
      }
    } catch (err) {
      // Axios interceptor handles console noise, we handle the UI feedback
      const message = err.response?.data?.message || "Login failed. Please check your connection.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
      <div className="
        w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-2xl 
        bg-white/10 transform transition duration-500 hover:scale-[1.02]
      ">
        {/* Logo or Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-500 rounded-full shadow-lg">
            <FaUser className="text-white text-3xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-white/80 mb-8">
          Login to manage your reviews
        </p>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); login(); }} className="flex flex-col gap-4 text-white">

          {/* Email Input with Icon */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-white/70 text-lg" />
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

          {/* Password Input with Icon */}
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

          <Link to="/login/forgotpassword" className="text-end hover:underline text-sm">Forgot password?</Link>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg bg-white text-indigo-900 rounded-lg font-semibold 
                       hover:bg-gray-200 transition ${loading && "cursor-disabled"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/80 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-white font-semibold hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
