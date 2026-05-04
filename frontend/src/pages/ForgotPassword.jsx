import { useState } from 'react'
import { FaUser } from 'react-icons/fa';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';

function ForgotPassword() {
    const [form, setForm] = useState({ email: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const requestReset = async () => {
        if (form.email.length <= 3) {
            toast.error("Invalid Email");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/api/auth/forgot-password", { email: form.email });
            const data = res.data;

            if (data.success) {
                toast.success(data.message || "Reset link has been sent.");
            } else {
                toast.error(data.message || "Failed to send reset email.");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Reset request failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
            <Link to='/login' className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Back to Login</Link>
            <div className="
                w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl 
                bg-white/10 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl
            ">

                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Reset Password
                </h2>
                <p className="text-center text-white/80 mb-8">
                    Change your password
                </p>

                <form onSubmit={(e) => { e.preventDefault(); requestReset(); }} className="flex flex-col gap-4 text-white">
                    <div className='flex flex-col justify-center items-center gap-6'>

                        <div className="w-full relative">
                            <FaUser className="absolute left-3 top-3 text-white/70 text-lg" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="off"
                                placeholder="Email"
                                autoFocus
                                required
                                className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition ${loading && "cursor-disabled"}`}
                        >
                            {loading ? "Sending reset link..." : "Send Reset Link"}
                        </button>


                    </div>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword