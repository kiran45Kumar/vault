import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import left_img from "../assets/left_img.png";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Password strength logic
  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register/", {
        username,
        email,
        password,
      });

      toast.success("User Registered Successfully");
      navigate("/login");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Too many requests. Try again later.");
      } else if (error.response?.data?.email) {
        toast.error(error.response.data.email[0]);
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT SIDE (hidden on mobile) */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-[#1e1b4b] to-[#4f46e5] items-center justify-center text-white p-12">
        <div className="max-w-md text-center">
          <img
            src={left_img}
            alt="Vault"
            className="w-56 lg:w-64 mx-auto mb-8 drop-shadow-2xl"
          />

          <h1 className="text-2xl lg:text-3xl font-semibold mb-3">
            Create Your Account
          </h1>

          <p className="text-sm text-gray-300">
            Start securing your important documents today.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 px-4 sm:px-6 py-8">
        <div className="bg-white shadow-xl md:shadow-2xl rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-1">
            Create Account
          </h2>

          <p className="text-center text-gray-500 text-sm mb-6">
            Register a new account
          </p>

          <div className="flex flex-col gap-4">
            {/* USERNAME */}
            <input
              type="text"
              placeholder="Enter your username"
              className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD WITH TOGGLE */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="border border-gray-200 rounded-lg p-3 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {/* PASSWORD STRENGTH */}
            {password && (
              <p
                className={`text-xs ${
                  getStrength() === "Strong"
                    ? "text-green-600"
                    : getStrength() === "Medium"
                      ? "text-yellow-600"
                      : "text-red-500"
                }`}
              >
                Strength: {getStrength()}
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md disabled:bg-indigo-300"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm text-gray-500 mt-2">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
