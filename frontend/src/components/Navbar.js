import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user }) {
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const toggleNotifications = () => setNotifications(!notifications);

  return (
    <nav className="flex items-center justify-between p-4 mx-auto mb-6 bg-white shadow-md rounded-xl max-w-7xl">
      
      {/* Logo + App Name */}
      <Link
        to="/dashboard"
        className="flex items-center gap-3 transition-transform transform hover:scale-105"
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>

        {/* App Name */}
        <span className="text-xl font-bold text-indigo-600 hover:text-blue-500">
          SynergySphere
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {/* Notification Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Notifications</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
            className="w-4 h-4"
          />
        </div>

        {/* User Info */}
        {user && (
          <div className="flex flex-col items-end text-right">
            <span className="font-semibold text-gray-800">{user.name}</span>
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-white transition-transform transform bg-red-500 rounded-lg hover:bg-red-600 hover:scale-105"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}