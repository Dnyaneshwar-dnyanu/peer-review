import React, {useState} from 'react'
import Loader from './Loader';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function EnterRoom({ toggleModal }) {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [loading, setLoading] = useState(false);

    const enterRoom = async () => {
        if(roomCode.trim().length < 6 ) {
            return toast.error("Invalid room code");
        }

        try {
            setLoading(true);

            const res = await api.get(`/api/student/room/${roomCode}/join`);

            if (res.data.success) {
                navigate(`/student/room/${roomCode.toLowerCase()}/${res.data.roomID}`);
            }

        } catch (err) {
            const errMessage = err.response?.data?.message || "Failed to join room";
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    }

    if(loading) 
        return <Loader />

    return (
        <div className="fixed z-10 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl sm:p-8 p-4 sm:mx-0 mx-5 rounded-xl shadow-2xl border border-white/20 w-full max-w-md">

                <h2 className="text-2xl font-bold text-white mb-4">
                    Enter Room Code
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); enterRoom(); }}>
                    <input
                        type="text"
                        placeholder="Room Code"
                        autoFocus
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        className="
                    w-full p-3 rounded-lg bg-white/20 placeholder-white/70 
                    border border-white/30 focus:bg-white/30 outline-none
                  "
                    />

                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setRoomCode("");
                                toggleModal(false);
                            }}
                            className="py-2 px-4 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30"
                        >
                            Cancel
                        </button>

                        <button type="submit"
                            className="py-2 px-4 rounded-lg bg-white text-indigo-900 font-semibold hover:bg-gray-200"
                        >
                            Join Room
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default EnterRoom