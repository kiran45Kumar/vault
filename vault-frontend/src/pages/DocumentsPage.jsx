/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import {
    FiEye,
    FiTrash2,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiX
} from "react-icons/fi";
import { useSwipeable } from "react-swipeable";

function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [previewIndex, setPreviewIndex] = useState(null);

    const itemsPerPage = 5;
    const token = localStorage.getItem("token");

    const fetchDocs = async () => {
        const res = await api.get("/documents/", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setDocs(res.data.results || res.data || []);
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this document?")) return;

        await api.delete(`/documents/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setDocs((prev) => prev.filter((doc) => doc.id !== id));
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const processedDocs = docs
        .filter((doc) =>
            doc.title.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === "created_at") {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            return sortOrder === "asc" ? valA - valB : valB - valA;
        });

    const totalPages = Math.ceil(processedDocs.length / itemsPerPage);
    const paginatedDocs = processedDocs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getType = (url) =>
        url ? url.split(".").pop().toUpperCase() : "—";

    // 🔥 SWIPE HANDLERS
    const handlers = useSwipeable({
        onSwipedLeft: () =>
            previewIndex < paginatedDocs.length - 1 &&
            setPreviewIndex(previewIndex + 1),
        onSwipedRight: () =>
            previewIndex > 0 && setPreviewIndex(previewIndex - 1),
        trackMouse: true,
    });

    if (!token) return <Navigate to="/login" replace />;

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                        My Documents
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage and preview your files
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden space-y-4">
                {paginatedDocs.map((doc, index) => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl shadow border">
                        <div className="flex justify-between">
                            <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-xs text-gray-500">
                                    {doc.category_display}
                                </p>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {getType(doc.file_url)}
                            </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(doc.created_at).toLocaleDateString("en-IN")}
                        </p>

                        <div className="flex justify-between mt-4 text-sm">
                            <button onClick={() => setPreviewIndex(index)}>
                                <FiEye /> View
                            </button>

                            <a href={doc.file_url} target="_blank">
                                <FiDownload /> Download
                            </a>

                            <button onClick={() => handleDelete(doc.id)}>
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
                <table className="w-full text-sm min-w-175">
                    <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th onClick={() => handleSort("title")} className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Category</th>
                            <th onClick={() => handleSort("created_at")} className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedDocs.map((doc, index) => (
                            <tr key={doc.id} className="  ">
                                <td className="px-6 py-4">{doc.title}</td>
                                <td className="px-6 py-4">{getType(doc.file_url)}</td>
                                <td className="px-6 py-4">{doc.category_display}</td>
                                <td className="px-6 py-4">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => setPreviewIndex(index)}>
                                        <FiEye />
                                    </button>
                                    <button onClick={() => handleDelete(doc.id)}>
                                        <FiTrash2 />
                                    </button>
                                    <a href={doc.file_url} target="_blank">
                                        <FiDownload />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-sm">
                    Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        <FiChevronLeft />
                    </button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* 🔥 SWIPE MODAL */}
            {previewIndex !== null && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setPreviewIndex(null)}
                        className="absolute top-4 right-4 text-white text-2xl"
                    >
                        <FiX />
                    </button>

                    <div {...handlers} className="w-full flex justify-center px-4">
                        {paginatedDocs[previewIndex].file_url.match(/\.(jpg|png|jpeg)$/i) ? (
                            <img
                                src={paginatedDocs[previewIndex].file_url}
                                className="max-h-[80vh]"
                            />
                        ) : (
                            <iframe
                                src={paginatedDocs[previewIndex].file_url}
                                className="w-full h-[80vh]"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentsPage;