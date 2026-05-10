/* eslint-disable react-hooks/set-state-in-effect */
import { Navigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUpload,
  FiUser,
  FiLogOut,
  FiBell,
} from "react-icons/fi";
import api from "../api/axios";
import { useEffect, useState } from "react";
import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";

function Dashboard() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  const [docs, setDocs] = useState([]);
  const [initial, setInitial] = useState("A");


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/");
        const username = res.data.username;

        if (username) {
          setInitial(username.charAt(0).toUpperCase());
          console.log("Profile data:", res.data);
        }
      } catch (err) {
        console.log("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);
  const fetchDocs = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/documents/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDocs(res.data.results || res.data || []);
  };
  useEffect(() => {
    fetchDocs();
  }, []);


  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="">
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        {/* SIDEBAR */}
        <div className="w-60 bg-white shadow-md border-gray-800 px-5 py-6 flex flex-col justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold mb-8 flex items-center gap-2">
              🛡 <span>Vault</span>
            </h1>

            <nav className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
                <FiHome /> Dashboard
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <FiFileText /> My Documents
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <FiUpload /> Upload Document
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <FiUser /> Profile
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 mt-4">
                <FiLogOut /> Logout
              </div>
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
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TOP BAR */}
          <div className="flex justify-between items-center bg-white px-8 py-5 p-6 border-r-gray-50 shadow-md">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
              <p className="text-sm text-gray-500">
                Upload and manage your documents securely.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <FiBell className="text-gray-500 text-lg cursor-pointer" />

              <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* UPLOAD BOX */}
            <UploadDocument onUpload={fetchDocs} />

            {/* DOCUMENT LIST */}
            <DocumentList docs={docs} setDocs={setDocs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
