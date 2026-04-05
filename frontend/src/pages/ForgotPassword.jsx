import { useState } from 'react'
import { FaUser, FaLock } from 'react-icons/fa';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';

function ForgotPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const changePassword = async () => {

        if (form.password != form.confirmPassword) {
            return toast.error('Password and Confirm password should be same');
        }

        if (form.password.trim().length < 4) {
            return toast.error('Password should contain atleast 4 characters');
        }

        try {
            setLoading(true);

            const res = await api.post(`/api/auth/updatePassword`,
                {email: form.email, password: form.password}
            );

            if (res.status !== 200) throw new Error("Failed");

            if (res.data.success) {
                toast.success("Password Updated Successfully!");
                navigate('/login');

            } else 
                toast.error(res.data.message);
            
            setForm({ email: "", password: "", confirmPassword: "" });

        } catch (err) {
            const errMessage = err.response?.data?.message || "Internal server error";
            toast.error(errMessage);

        } finally {
            setLoading(false);
        }
    };

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

                <form onSubmit={(e) => { e.preventDefault(); changePassword(); }} className="flex flex-col gap-4 text-white">
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

                    <div className="w-full relative">
                        <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="Password"
                            required
                            className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
                        />
                    </div>

                    <div className="w-full relative">
                        <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="Confirm Password"
                            required
                            className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold 
                       hover:bg-gray-200 transition ${loading && "cursor-disabled"}`}
                    >
                        { loading ? "Updating password..." :  "Update password" }
                    </button>
                </div>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword