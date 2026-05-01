/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
    FiEye,
    FiTrash2,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiDownload
} from "react-icons/fi";


function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [previewDoc, setPreviewDoc] = useState(null);

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
        const handleKey = (e) => {
            if (e.key === "Escape") setPreviewDoc(null);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this document?")) return;

        await api.delete(`/documents/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setDocs((prev) => prev.filter((doc) => doc.id !== id));
    };
    // const handleDownload = async (doc) => {
    //     try {
    //         const response = await fetch(doc.file_url);
    //         const blob = await response.blob();

    //         const url = window.URL.createObjectURL(blob);
    //         const a = document.createElement("a");

    //         a.href = url;
    //         a.download = doc.title || "file";
    //         document.body.appendChild(a);
    //         a.click();

    //         a.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (err) {
    //         console.error("Download failed", err);
    //     }
    // };

    // SORT
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    // ✅ FILTER + SORT
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

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // ✅ PAGINATION
    const totalPages = Math.ceil(processedDocs.length / itemsPerPage);
    const paginatedDocs = processedDocs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // const formatSize = (size) => {
    //     if (!size) return "—";
    //     if (size < 1024) return size + " B";
    //     if (size < 1024 * 1024)
    //         return (size / 1024).toFixed(1) + " KB";
    //     return (size / (1024 * 1024)).toFixed(1) + " MB";
    // };

    const getType = (url) =>
        url ? url.split(".").pop().toUpperCase() : "—";

    if (!token) return <Navigate to="/" replace />;
    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        My Documents
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage, preview, and organize your files
                    </p>
                </div>

                {/* SEARCH */}
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* TABLE CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <table className="w-full text-sm">

                    {/* TABLE HEADER */}
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                            <th
                                onClick={() => handleSort("title")}
                                className="px-6 py-4 text-left cursor-pointer hover:text-gray-700"
                            >
                                Name
                            </th>

                            <th className="px-6 py-4 text-left">Type</th>

                            <th className="px-6 py-4 text-left">Category</th>

                            <th
                                onClick={() => handleSort("created_at")}
                                className="px-6 py-4 text-left cursor-pointer hover:text-gray-700"
                            >
                                Uploaded
                            </th>

                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                        {paginatedDocs.map((doc) => (
                            <tr
                                key={doc.id}
                                className="hover:bg-gray-50 transition duration-150 border-b border-gray-100 last:border-none"
                            >
                                {/* NAME */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-lg">
                                            📄
                                        </div>
                                        <span className="font-medium text-gray-800 truncate max-w-50">
                                            {doc.title}
                                        </span>
                                    </div>
                                </td>

                                {/* TYPE */}
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                        {getType(doc.file_url)}
                                    </span>
                                </td>

                                {/* SIZE */}
                                <td className="px-6 py-4 text-gray-600">
                                    {doc.category_display}
                                </td>

                                {/* DATE */}
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(doc.created_at).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                {/* ACTIONS */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">

                                        {/* VIEW */}
                                        <button
                                            onClick={() => setPreviewDoc(doc)}
                                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                                        >
                                            <FiEye size={18} />
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>

                                        <a
                                            href={doc.file_url}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition"
                                        >
                                            <FiDownload size={18} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* PAGINATION */}
                <div className="flex items-center justify-between px-6 py-4 border-t-gray-400 shadow-md bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-medium">{currentPage}</span> of{" "}
                        <span className="font-medium">{totalPages}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40"
                        >
                            <FiChevronLeft />
                        </button>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">

                    {/* MAIN WRAPPER */}
                    <div className="relative w-[85%] h-[85%] flex flex-col">

                        {/* TOP BAR */}
                        <div className="flex items-center justify-between px-4 py-3 text-white">

                            {/* LEFT */}
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📄</span>
                                <p className="text-sm font-medium truncate max-w-100">
                                    {previewDoc.title}
                                </p>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => window.open(previewDoc.file_url, "_blank")}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                                >
                                    ⬇ Download
                                </button>

                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="text-lg hover:opacity-70"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* PREVIEW CARD */}
                        <div className="flex-1 flex items-center justify-center">

                            <div className="bg-white rounded-2xl shadow-2xl w-full h-full flex items-center justify-center p-4">

                                {/* IMAGE */}
                                {previewDoc.file_url.match(/\.(jpg|jpeg|png)$/i) && (
                                    <img
                                        src={previewDoc.file_url}
                                        className="max-h-full max-w-full object-contain rounded-xl"
                                    />
                                )}

                                {/* PDF */}
                                {previewDoc.file_url.match(/\.pdf$/i) && (
                                    <iframe
                                        src={previewDoc.file_url}
                                        className="w-full h-full rounded-xl"
                                        title="preview"
                                    />
                                )}

                                {/* FALLBACK */}
                                {!previewDoc.file_url.match(/\.(jpg|jpeg|png|pdf)$/i) && (
                                    <div className="text-center text-gray-500">
                                        <p className="text-lg font-medium">Preview not available</p>
                                        <button
                                            onClick={() => window.open(previewDoc.file_url, "_blank")}
                                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Open File
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* BOTTOM TOOLBAR (OPTIONAL LIKE IMAGE) */}
                        <div className="flex justify-center mt-3">
                            <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-4 text-sm shadow-lg">
                                <span>🔍</span>
                                <span>➖</span>
                                <span>➕</span>
                                <span>⤢</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentsPage;