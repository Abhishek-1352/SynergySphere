// src/components/Navbar.js
import React, { useState } from "react";

export default function Navbar({ user }) {
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const toggleNotifications = () => setNotifications(!notifications);

  return (
    <nav className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center mb-6">
      <div className="text-xl font-bold text-indigo-600">SynergySphere</div>

      <div className="flex items-center gap-6">
        {/* Notification Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-gray-700 text-sm">Notifications</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
            className="h-4 w-4"
          />
        </div>

        {/* User Info */}
        {user && (
          <div className="flex flex-col items-end text-right">
            <span className="font-semibold text-gray-800">{user.name}</span>
            <span className="text-gray-500 text-sm">{user.email}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
