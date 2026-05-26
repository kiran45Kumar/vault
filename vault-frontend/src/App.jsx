import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import UploadPage from "./pages/UploadPage";
import DocumentsPage from "./pages/DocumentsPage";
import Profile from "./pages/ProfilePage";
import VaultLanding from "./pages/VaultLanding";
import ResetPassword from "./pages/ResetPassword";
import useAutoLogout from "./hooks/useAutoLogout";


function AppRoutes() {

  const [, setToken] = useState(
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );

  const navigate = useNavigate();

  // AUTO LOGOUT
  useAutoLogout(() => {

    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refresh");

    setToken(null);

    navigate("/login");
  });

  return (
    <>
      <Routes>

        <Route path="/" element={<VaultLanding />} />

        <Route
          path="/login"
          element={<Login setToken={setToken} />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/reset-password/:uid/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/dashboard"
          element={
            (
              localStorage.getItem("token") ||
              sessionStorage.getItem("token")
            )
              ? <DashboardLayout />
              : <Navigate to="/" />
          }
        >

          <Route index element={<DashboardHome />} />

          <Route
            path="upload"
            element={<UploadPage />}
          />

          <Route
            path="documents"
            element={<DocumentsPage />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

        </Route>

      </Routes>

    </>
  );
}


export default function App() {

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}