import React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { FaHome, FaTasks, FaUserGraduate, FaSignOutAlt } from "react-icons/fa";
import { MdAssessment } from "react-icons/md";

function StudentDashboard() {
  const logoutBtn = useRef(null);

  const logout = async () => {
    const res = await fetch('http://localhost:3000/api/auth/logoutUser', {
      method: "GET",
      credentials: "include"
    });

    let data = await res.json();

    if (!data.auth) {
      window.location.href = '/Login';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 flex">

      {/* Sidebar */}
      <div className="w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20">
        <h2 className="text-2xl font-bold text-white mb-10">Peer Review</h2>

        <ul className="flex flex-col gap-6 text-white text-lg">
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <FaHome /> Home
          </li>
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <FaTasks /> Projects
          </li>
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <MdAssessment /> Reviews
          </li>
          <li className="flex items-center gap-3 hover:text-gray-200 cursor-pointer">
            <FaUserGraduate /> Profile
          </li>
          <li ref={logoutBtn} onClick={logout} className="flex items-center gap-3 mt-10 text-red-200 hover:text-red-100 cursor-pointer">
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 text-white">

        {/* Greeting Section */}
        {/* <h1 className="text-4xl font-bold mb-2">Welcome back, { user.name.split(' ')[0] }!</h1> */}
        <p className="text-white/80 mb-10">Here’s your dashboard overview</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* Card 1 */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            hover:scale-[1.03] transition transform shadow-lg
          ">
            <h3 className="text-xl font-semibold">Total Projects</h3>
            <p className="text-4xl font-bold mt-4">4</p>
          </div>

        </div>

        {/* Projects Section */}
        <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Project Card */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            hover:scale-[1.02] transition shadow-md
          ">
            <h3 className="text-xl font-bold">AI Peer Review System</h3>
            <p className="text-white/70 mt-2">
              Students can review and score other student projects.
            </p>
            <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">
              View Project
            </button>
          </div>

          {/* Project Card */}
          <div className="
            p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 
            hover:scale-[1.02] transition shadow-md
          ">
            <h3 className="text-xl font-bold">Web Dev Mini Project</h3>
            <p className="text-white/70 mt-2">
              Build a responsive website and get peer-assessed.
            </p>
            <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">
              View Project
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;