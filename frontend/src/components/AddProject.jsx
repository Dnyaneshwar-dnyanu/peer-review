import { useState } from 'react'
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

function AddProject({ onClose }) {
    const roomID = useParams().roomID;
    const [form, setForm] = useState({ title: "", description: "", type: "individual" });
    const [disableButton, setDisableButton] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberUSN, setMemberUSN] = useState("");

    let handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const addMember = async () => {
        if (memberUSN.trim().length < 10) {
            return toast.error("Enter the details of member to add!");
        };
        
        const alreadyMember = members.some((member) => member.usn === memberUSN);
        
        if (alreadyMember) {
            console.log(members);
            
            return toast.error('This student is already added!');
        }
        
        let res = await api.post(`/api/auth/validateStudent`, { usn: memberUSN });
        
        if (!res.data.success) {
            return toast.error(res.data.message);
        }
        
        setMembers((prev) => [
            ...prev,
            {
                id: res.data._id,
                name: res.data.name,
                usn: memberUSN.trim(),
            },
        ]);
        
        toast.success(res.data.message);
        
        setMemberUSN("");
    };

    const removeMember = (usn) => {
        setMembers(members.filter((m) => m.usn !== usn));
        toast.success("Student removed successfully!");
    };

    let submitProject = async () => {
        if (form.title.trim().length <= 3) {
            return toast.error('Invalid details...');
        }

        try {
            setDisableButton(true);

            await api.post(`/api/projects/add/${roomID}`,
                { title: form.title, description: form.description, type: form.type, members }
            );

            toast.success('Project added successfully!');

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Something error occurred!");

        } finally {
            setForm({ title: "", description: "", type: "individual" });
            setDisableButton(false);
        }
    }
    return (
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl md:mb-10 mb-6">
            <h2 className="text-2xl text-white font-bold mb-6">Submit Your Project</h2>

            <div className="flex flex-col items-center gap-2 md:px-15 text-white/80">
                <input type="text" name="title" value={form.title} onChange={handleChange} autoComplete='off' placeholder="Project title" className="w-full border outline-none p-3 rounded-lg bg-white/20 border-white/30 placeholder-white/70 focus:bg-white/30" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="tell us about your project...." className="w-full border outline-none p-3 rounded-lg bg-white/20 border-white/30 placeholder-white/70 focus:bg-white/30"></textarea>
                <div className='w-full flex justify-start gap-4 py-2 px-3'>
                    <input type="radio" name="type" value="individual" checked={form.type === "individual"} onChange={handleChange} className='w-4' /> Individual
                    <input type="radio" name="type" value="group" checked={form.type === "group"} onChange={handleChange} className='w-4' /> Group
                </div>
                <div className={`
                        overflow-hidden
                        transition-all duration-500 ease-in-out
                        ${form.type == "group" ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} `}>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="email"
                            value={memberUSN}
                            onChange={(e) => setMemberUSN(e.target.value)}
                            placeholder="Student USN"
                            className=" px-4 py-2 rounded-xl border border-gray-200 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={addMember}
                            className="md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow hover:opacity-90 transition"
                        >
                            + Add Member
                        </button>


                    </div>
                    <div className='mt-3 flex flex-col gap-2'>
                        {
                            members.length === 0 ? (
                                <p>No teamates added yet.</p>
                            ) : (
                                members.map(member => {
                                    return <div
                                        key={member.id}
                                        className="w-full flex items-center justify-between gap-4 px-4 py-2 rounded-xl border border-gray-200 bg-white"
                                    >
                                        <div className='flex items-center gap-4'>
                                            <p className="font-semibold text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-600">{member.usn}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeMember(member.usn)}
                                            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                })
                            )
                        }
                    </div>
                </div>
                <button onClick={submitProject}
                    disabled={disableButton}
                    className={`w-full mt-2 px-6 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-gray-200 transition ${disableButton && "cursor-disabled"}`}>
                    {disableButton ? "Submitting..." : "Submit Project"}
                </button>
            </div>
        </div>
    )
}

export default AddProject