import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import api from "../api/axios";
import { toast } from "react-toastify";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Password and confirm password should be same");
    }

    if (form.password.trim().length < 4) {
      return toast.error("Password should contain at least 4 characters");
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/reset-password", {
        token,
        password: form.password
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Reset failed");
      }

      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Reset failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
      <Link to='/login' className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md">
        <IoArrowBackOutline className="text-zinc-600" /> Back to Login
      </Link>
      <div className="w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl bg-white/10">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Set New Password
        </h2>
        <p className="text-center text-white/80 mb-8">
          Enter a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white">
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Password"
              required
              className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Confirm Password"
              required
              className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 focus:bg-white/30 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition ${loading && "cursor-disabled"}`}
          >
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;