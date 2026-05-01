import { useEffect, useState } from "react";
import api from "../api/axios";
import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";

function DashboardHome() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const fetchDocs = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const res = await api.get("/documents/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDocs(res.data.results || res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocs();
  }, []);
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      <UploadDocument onUpload={fetchDocs} />
      <DocumentList docs={docs} setDocs={setDocs} loading={loading} setLoading = {setLoading} />
    </div>
  );
}

export default DashboardHome;