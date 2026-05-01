import { Outlet, Navigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUpload,
  FiUser,
  FiLogOut,
  FiBell,
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
function DashboardLayout() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) return <Navigate to="/" replace />;

  const navItem = (path) =>
    location.pathname === path
      ? "bg-indigo-50 text-indigo-600 font-medium"
      : "text-gray-600 hover:bg-gray-100";
  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-60 bg-white shadow-md px-5 py-6 flex flex-col justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold mb-8 flex items-center gap-2">
            🛡 <span>Vault</span>
          </h1>

          <nav className="flex flex-col gap-7 text-sm">
            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${navItem("/dashboard")}`}
            >
              <FiHome /> Dashboard
            </Link>

            {/* DOCUMENTS */}
            <Link
                  to="/dashboard/documents"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                location.pathname === "/dashboard/documents"
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiFileText /> My Documents
            </Link>

            {/* UPLOAD */}
            <Link
              to="/dashboard/upload"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${navItem("/dashboard/upload")}`}
            >
              <FiUpload /> Upload Document
            </Link>

            {/* PROFILE */}
            <Link
              to="/dashboard/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${navItem("/dashboard/profile")}`}
            >
              <FiUser /> Profile
            </Link>

            {/* LOGOUT */}
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 mt-4 transition"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              <FiLogOut /> Logout
            </button>
          </nav>
        </div>

        {/* STORAGE */}
        <div className="bg-gray-50 p-4 rounded-xl text-xs">
          <p className="font-medium text-gray-700">Storage Used</p>
          <p className="text-gray-500 mb-2">2.4 GB / 10 GB</p>

          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-indigo-600 h-2 rounded-full w-[24%]" />
          </div>

          <p className="mt-1 text-indigo-600 font-medium">24%</p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="flex justify-between items-center bg-white px-8 py-5 shadow-md shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500">
              Upload and manage your documents securely.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <FiBell className="text-gray-500 text-lg cursor-pointer" />

            <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              A
            </div>
          </div>
        </header>

        {/* CONTENT (ONLY THIS SCROLLS) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
