import { useEffect, useState } from "react";
import api from "../api/axios";

function DocumentList() {

    const [docs, setDocs] = useState([]);

    useEffect(() => {

        const fetchDocs = async () => {

            const token = localStorage.getItem("token");

            const res = await api.get("/documents/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDocs(res.data);
        };

        fetchDocs();

    }, []);

    return (
        <div>
            <h3>Your Documents</h3>

            {docs.length === 0 && <p>No documents uploaded yet.</p>}

            {docs.map((doc) => (
                <div key={doc.id} style={{ marginBottom: "10px" }}>
                    <p>
                        <strong>{doc.title}</strong> - {doc.category_display}
                    </p>
                    {doc.file_url && (
                        <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                            Download
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}

export default DocumentList;