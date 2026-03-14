import { useEffect, useState } from "react";
import api from "../api/axios";

function DocumentList() {

    const [docs, setDocs] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {

        const fetchDocs = async () => {

            const token = localStorage.getItem("token");

            const res = await api.get(`/documents/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDocs(res.data.results);
        };

        fetchDocs();

    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Content */}
            <div className="max-w-4xl mx-auto mt-8">

                <h2 className="text-lg font-semibold mb-4">
                    Your Documents
                </h2>

                {docs.length === 0 && (
                    <p className="text-gray-500">No documents uploaded yet.</p>
                )}

                <div className="space-y-4">

                    {docs.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                        >

                            <div>
                                <p className="font-semibold text-gray-800">
                                    {doc.title}
                                </p>

                                <p className="text-sm text-gray-500">
                                    Category: {doc.category_display}
                                </p>
                            </div>

                            {doc.file_url && (
                                <a
                                    href={doc.file_url}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Download
                                </a>
                            )}

                        </div>
                    ))}

                </div>
                <button onClick={() => setPage(page - 1)}>Previous</button>
                <button onClick={() => setPage(page + 1)}>Next</button>
            </div>

        </div>
    );
}

export default DocumentList;