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
    }
    catch (error) {
      alert(error.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };
  return (
    <div>

      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

    </div>
  );
}

export default Login;