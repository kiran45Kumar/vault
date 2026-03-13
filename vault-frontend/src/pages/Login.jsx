import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/login/", { email, password });

      localStorage.setItem("token", response.data.access);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login to Vault
        </h2>

        <div className="flex flex-col gap-4">

          <input
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;