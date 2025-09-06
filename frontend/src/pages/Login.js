import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  // ✅ Refs for email and password inputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
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
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div
        className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-700 ${
          animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
        <p className="mb-6 text-sm text-center text-gray-500">
          Login to continue collaborating with <b>SynergySphere</b>
        </p>

        <div className="relative mb-4">
          <FaEnvelope className="absolute text-gray-400 left-3 top-3" />
          <input
            ref={emailRef}
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                passwordRef.current.focus();
              }
            }}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <div className="relative mb-3">
          <FaLock className="absolute text-gray-400 left-3 top-3" />
          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <p className="mt-3 text-sm text-center text-gray-500">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </p>

        <button
          onClick={handleLogin}
          className="w-full py-3 mt-6 font-semibold text-white transition transform rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105"
        >
          Login
        </button>

        <p className="mt-5 text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Signup here
          </Link>
        </p>
      </div>

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

export default Login;