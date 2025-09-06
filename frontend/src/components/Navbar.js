// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: load notification preference from localStorage
    const pref = localStorage.getItem("notifications");
    if (pref !== null) setNotificationsEnabled(pref === "true");
  }, []);

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("notifications", newValue);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="text-xl font-bold text-indigo-600">SynergySphere</div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex flex-col text-right">
          <span className="font-semibold text-gray-800">{user.name}</span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={toggleNotifications}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="text-gray-700 text-sm">Notifications</span>
          </label>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
          className="focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg p-4 space-y-4 z-50 animate-fadeIn">
            <div className="flex flex-col text-gray-800">
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={toggleNotifications}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="text-gray-700 text-sm">Notifications</span>
            </label>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white w-full px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
