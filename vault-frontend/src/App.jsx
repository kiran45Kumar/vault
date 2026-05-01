import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import { useState } from "react";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Navigate } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UploadPage from "./pages/UploadPage";
import DocumentsPage from "./pages/DocumentsPage";
import Profile from "./pages/ProfilePage";
import VaultLanding from "./pages/VaultLanding";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VaultLanding />} />
        <Route path="/login" element={<Login  setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={token ? <DashboardLayout /> : <Navigate to="/" />}
        >
          {/* DEFAULT PAGE */}
          <Route index element={<DashboardHome />} />
          {/* FUTURE ROUTES */}
          <Route path="upload" element={<UploadPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
