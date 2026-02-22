import { useState } from 'react'
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import Loader from '../components/Loader';

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

            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auth/updatePassword`,
                form, { withCredentials: true }
            );

            if (res.status !== 200) throw new Error("Failed");

            if (res.data.success) {
                toast.success("Password Updated Successfully!");
                navigate('/login');

            } else 
                toast.error(res.data.message);
            
            setForm({ email: "", password: "", confirmPassword: "" });

        } catch (err) {
            console.error(err);
            toast.error("Something error occurred!");

        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return <Loader />

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black px-4">
            <Link to='/Login' className="absolute left-3 top-3 flex items-center gap-2 p-3 border border-white/10 bg-white/65 font-semibold rounded-md"> <IoArrowBackOutline className="text-zinc-600" /> Back to Home</Link>
            <div className="
                w-full max-w-md p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl 
                bg-white/10 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl
            ">

                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Welcome Back
                </h2>
                <p className="text-center text-white/80 mb-8">
                    Change your password
                </p>

                <div className="flex flex-col gap-4 text-white">

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

                    <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-white/70 text-lg" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="Confirm Password"
                            className="w-full p-3 pl-10 rounded-lg bg-white/20 placeholder-white/70 border border-white/30 
                         focus:bg-white/30 outline-none"
                        />
                    </div>

                    <button
                        onClick={changePassword}
                        className="w-full py-3 bg-white text-indigo-900 rounded-lg font-semibold 
                       hover:bg-gray-200 transition"
                    >
                        Update password
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword