import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
    alert(res.data.msg);
    navigate("/");
  } catch (err) {
    alert(err.response?.data?.error || "Error sending reset link.");
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

      <div className="w-full max-w-md p-8 bg-white shadow-2xl bg-opacity-95 backdrop-blur-sm rounded-2xl">
        <div className="flex items-center mb-6 space-x-3">
          <Link to="/" className="flex items-center text-blue-500 hover:underline">
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
        <p className="mb-6 text-sm text-center text-gray-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <div className="relative mb-6">
          <FaEnvelope className="absolute text-gray-400 left-3 top-3" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 pl-10 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleForgotPassword}
          className="w-full py-3 font-semibold text-white transition transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105"
        >
          Send Reset Link
        </button>
      </div>
    </div>
  );
}

export default ForgetPassword;