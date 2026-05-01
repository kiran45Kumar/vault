import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import left_img from "../assets/left_img.png";

function Login({ setToken }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login/", { email, password });

      localStorage.setItem("token", response.data.access);
      setToken(response.data.access);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-[#1e1b4b] to-[#4f46e5] items-center justify-center text-white p-12">

        <div className="max-w-md text-center">
          <img
            src={left_img}
            alt="Vault"
            className="w-56 lg:w-64 mx-auto mb-8 drop-shadow-2xl"
          />

          <h1 className="text-2xl lg:text-3xl font-semibold mb-3">
            Secure Your Important Documents
          </h1>

          <p className="text-sm text-gray-300">
            Upload, store and access your documents safely in one place.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 px-4 sm:px-6 py-8">

        <div className="bg-white shadow-xl md:shadow-2xl rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-md">

          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-1">
            Welcome Back!
          </h2>

          <p className="text-center text-gray-500 text-sm mb-6">
            Login to your account
          </p>

          <div className="flex flex-col gap-4">

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
                placeholder="Enter your password"
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

            {/* OPTIONS */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-indigo-600" />
                Remember me
              </label>

              <span className="text-indigo-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md disabled:bg-indigo-300"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="flex-1 h-px bg-gray-200"></div>
              or
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* GOOGLE BUTTON */}
            <button className="border border-gray-200 rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                alt="google"
              />
              Login with Google
            </button>

            {/* REGISTER */}
            <p className="text-center text-sm text-gray-500 mt-2">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Register
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;