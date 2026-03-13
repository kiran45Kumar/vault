import { useState } from "react";
import api from "../api/axios";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      await api.post("/register/", {
        username,
        email,
        password
      });

      alert("User Registered Successfully");

    } catch (error) {

      console.log(error);
      alert("Registration failed");

    }

  };

  return (
    <div>

      <h2>Register</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>

    </div>
  );
}

export default Register;