import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      navigate("/");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-center bg-cover"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/abstract-technology-particle-background_52683-25766.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Signup Card */}
      <div
        className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-700 ${
          animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">Join SynergySphere</h2>
        <p className="mb-6 text-sm text-center text-gray-500">
          Empower your team. Collaborate efficiently. Stay aligned and proactive.
        </p>

        {/* Name Input */}
        <div className="relative mb-4">
          <FaUser className="absolute text-gray-400 left-3 top-3" />
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {/* Email Input */}
        <div className="relative mb-4">
          <FaEnvelope className="absolute text-gray-400 left-3 top-3" />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <FaLock className="absolute text-gray-400 left-3 top-3" />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-3 font-semibold text-white transition transform rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105"
        >
          Signup
        </button>

        <p className="mt-5 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="max-w-md px-4 mt-6 space-y-2 text-sm text-center text-gray-300">
        <div className="flex items-center justify-center space-x-2">
          <FaPhoneAlt />
          <span>+1 (555) 123-4567</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <FaMapMarkerAlt />
          <span>123 Collaboration Blvd, Suite 100, Tech City</span>
        </div>
        <div>
          <span>support@synergysphere.com</span>
        </div>
        <p className="mt-2 text-xs">© 2025 SynergySphere. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Signup;