/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../api/axios";
import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";


function DashboardHome() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token"); const fetchDocs = async () => {
      try {
        setLoading(true);

        const res = await api.get("/documents/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDocs(res.data.results || res.data || []);
      } catch (err) {
        console.error("FETCH DOCS ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDocs();
  }, []);
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-8">
      <UploadDocument onUpload={fetchDocs} />
      <DocumentList docs={docs} setDocs={setDocs} loading={loading} setLoading={setLoading} />
    </div>
  );
}

export default DashboardHome;