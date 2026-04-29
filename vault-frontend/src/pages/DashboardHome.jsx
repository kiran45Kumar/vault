import { useEffect, useState } from "react";
import api from "../api/axios";
import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";

function DashboardHome() {
  const [docs, setDocs] = useState([]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocs();
  }, []);

  return (
    <div className="space-y-8">
      <UploadDocument onUpload={fetchDocs} />
      <DocumentList docs={docs} setDocs={setDocs} />
    </div>
  );
}

export default DashboardHome;