/* eslint-disable react-hooks/static-components */
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUpload,
  FiUser,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
} from "react-icons/fi";
import api from "../api/axios";
import { useEffect, useState } from "react";

function DashboardLayout() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token"); const location = useLocation();
  const [userData, setUserData] = useState({
    username: "",
    profile_image: "",
  }); const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
          },
        });
        setUserData({
          username: res.data.username,
          profile_image: res.data.profile_image,
        });
      } catch (err) {
        console.log("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  if (!token) return <Navigate to="/login" replace />;

  const navItem = (path) =>
    location.pathname === path
      ? "bg-indigo-50 text-indigo-600 font-medium"
      : "text-gray-600 hover:bg-gray-100";

  const Sidebar = () => (
    <aside className="w-60 bg-white shadow-md px-5 py-6 flex flex-col justify-between h-full relative">

      {/* CLOSE BUTTON (mobile only) */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 text-gray-500 md:hidden"
      >
        <FiX size={20} />
      </button>

      <div>
        <h1 className="text-lg font-semibold mb-8 flex items-center gap-2">
          🛡 <span>Vault</span>
        </h1>

        <nav className="flex flex-col gap-4 text-sm">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${navItem("/dashboard")}`}
          >
            <FiHome /> Dashboard
          </Link>

          <Link
            to="/dashboard/documents"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${navItem("/dashboard/documents")}`}
          >
            <FiFileText /> Documents
          </Link>

          <Link
            to="/dashboard/upload"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${navItem("/dashboard/upload")}`}
          >
            <FiUpload /> Upload
          </Link>

          <Link
            to="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${navItem("/dashboard/profile")}`}
          >
            <FiUser /> Profile
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${sidebarOpen ? "visible" : "invisible"}`}>

          {/* SIDEBAR */}
          <div
            className={`w-60 bg-white shadow-md transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <Sidebar />
          </div>

          {/* BACKDROP */}
          <div
            className={`flex-1 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="flex justify-between items-center bg-white px-4 md:px-8 py-4 shadow-md">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden text-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Dashboard
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Manage your documents
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 md:gap-5">
            <FiBell className="text-gray-500 text-lg cursor-pointer" />

            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">

              {userData.profile_image ? (

                <img
                  src={userData.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">

                  {userData.username?.charAt(0).toUpperCase() || "U"}

                </div>

              )}

            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;