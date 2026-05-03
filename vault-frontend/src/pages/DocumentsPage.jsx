/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
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
import { toast } from "react-toastify";

function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [previewIndex, setPreviewIndex] = useState(null);

    const [unlockLoading, setUnlockLoading] = useState(false);

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);

    const [showLockModal, setShowLockModal] = useState(false);
    const [lockPassword, setLockPassword] = useState("");
    const [lockDocId, setLockDocId] = useState(null);
    const [lockLoading, setLockLoading] = useState(false);

    const passwordRef = useRef(null);

    const [unlockToken, setUnlockToken] = useState({});
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

    // const handleLock = async (docId) => {
    //     const password = prompt("Set password for this document");

    //     if (!password) return;

    //     try {
    //         await api.post(
    //             `/documents/${docId}/lock/`,
    //             { password },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             }
    //         );

    //         toast.success("Document locked 🔒");

    //         // remove any existing unlock token
    //         setUnlockToken(prev => {
    //             const updated = { ...prev };
    //             delete updated[docId];
    //             return updated;
    //         });

    //         fetchDocs(); // refresh UI

    //     } catch {
    //         alert("Failed to lock");
    //     }
    // };

    const handleUnlock = async () => {
        setUnlockLoading(true);

        try {
            const res = await api.post(
                `/documents/${selectedDoc.id}/unlock/`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const tokenUnlock = res.data.unlock_token;

            const updatedToken = {
                ...unlockToken,
                [selectedDoc.id]: tokenUnlock
            };

            setUnlockToken(updatedToken);

            toast.success("Unlocked 🔓");

            setShowPasswordModal(false);
            setPassword("");
            // setSearch("");  

            await handleViewDirect(selectedDoc, previewIndex, updatedToken);

        } catch {
            toast.error("Wrong password");
        } finally {
            setUnlockLoading(false);
        }
    };

    const handleViewDirect = async (doc, index, tokenMap) => {
        setLoadingPreview(true);

        try {
            const res = await api.get(`/documents/${doc.id}/view/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(tokenMap?.[doc.id] && {
                        "X-Unlock-Token": tokenMap[doc.id]
                    })
                }
            });

            setPreviewUrl(res.data.file_url);
            setPreviewIndex(index);


        } catch (err) {
            if (err.response?.data?.locked) {
                setSelectedDoc(doc);
                setShowPasswordModal(true);
            }
        } finally {
            setLoadingPreview(false);
        }
    };
    // const handleView = async (doc, index) => {
    //     setLoadingPreview(true);
    //     try {
    //         const tokenForDoc = unlockToken?.[doc.id];

    //         const res = await api.get(`/documents/${doc.id}/view/`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 ...(tokenForDoc ? { "X-Unlock-Token": tokenForDoc } : {})
    //             }
    //         });

    //         setPreviewUrl(res.data.file_url);
    //         setPreviewIndex(index);
    //         setLoadingPreview(false);

    //     } catch (err) {
    //         if (err.response?.data?.locked) {
    //             setSelectedDoc(doc);
    //             setShowPasswordModal(true);
    //         }
    //     }
    // };


    const openPreview = (doc, index) => {
        setPreviewIndex(index);
        setPreviewUrl(null);
        handleViewDirect(doc, index, unlockToken);
    };

    const openLockModal = (docId) => {
        setLockDocId(docId);
        setLockPassword("");
        setShowLockModal(true);
    };
    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPassword("");
        setSelectedDoc(null);
        setPreviewIndex(null);
    };

    const confirmLock = async () => {
        setLockLoading(true);

        try {
            await api.post(
                `/documents/${lockDocId}/lock/`,
                { password: lockPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Locked 🔒");

            setShowLockModal(false);
            setLockPassword("");
            setLockDocId(null);

            fetchDocs();

        } catch {
            toast.error("Failed to lock");
        } finally {
            setLockLoading(false);
        }
    };
    const processedDocs = docs
        .filter((doc) =>
            (doc.title ?? "").toString().toLowerCase().includes(search.toLowerCase())
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

    const getType = (url) => {
        if (!url) return "—";

        try {
            const pathname = new URL(url).pathname;
            return pathname.split(".").pop().toUpperCase();
        } catch {
            return "—";
        }
    };

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

                        {/* TOP */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-800">{doc.title}</p>
                                <p className="text-xs text-gray-500">
                                    {doc.category_display}
                                </p>

                                {/* 🔒 LOCK STATUS */}
                                <p className="text-xs mt-1">
                                    {doc.is_locked ? "🔒 Locked" : "🔓 Unlocked"}
                                </p>
                            </div>

                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {getType(doc.file_url)}
                            </span>
                        </div>

                        {/* DATE */}
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(doc.created_at).toLocaleDateString("en-IN")}
                        </p>

                        {/* ACTIONS */}
                        <div className="flex justify-between mt-4 text-sm">

                            <button onClick={() => openPreview(doc, index)}>
                                <FiEye /> View
                            </button>

                            <button onClick={() => openPreview(doc, index)}>
                                <FiDownload /> Download
                            </button>

                            {!doc.is_locked && (
                                <button onClick={() => openLockModal(doc.id)}>
                                    🔒 Lock
                                </button>
                            )}

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

                    <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                        <tr>
                            <th onClick={() => handleSort("title")} className="px-6 py-4 text-left cursor-pointer">Name</th>
                            <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Category</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th onClick={() => handleSort("created_at")} className="px-6 py-4 text-left cursor-pointer">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedDocs.map((doc, index) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition">

                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {doc.title}
                                </td>

                                <td className="px-6 py-4 text-gray-500">
                                    {getType(doc.file_url)}
                                </td>

                                <td className="px-6 py-4 text-gray-500">
                                    {doc.category_display}
                                </td>

                                {/* 🔒 STATUS */}
                                <td className="px-6 py-4">
                                    {doc.is_locked ? (
                                        <span className="text-red-500 text-xs">🔒 Locked</span>
                                    ) : (
                                        <span className="text-green-500 text-xs">🔓 Open</span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(doc.created_at).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                    })}
                                </td>

                                {/* ACTIONS */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-end items-center gap-3">

                                        <button
                                            onClick={() => openPreview(doc, index)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <FiEye />
                                        </button>

                                        <button
                                            onClick={() => openPreview(doc, index)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <FiDownload />
                                        </button>

                                        {!doc.is_locked && (
                                            <button
                                                onClick={() => openLockModal(doc.id)}
                                                className="p-2 rounded-lg hover:bg-yellow-100 transition"
                                            >
                                                🔒
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition"
                                        >
                                            <FiTrash2 />
                                        </button>

                                    </div>
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
                        {loadingPreview ? (
                            <div className="text-white text-sm animate-pulse">
                                Loading document...
                            </div>
                        ) : previewUrl?.match(/\.(jpg|png|jpeg)$/i) ? (
                            <img src={previewUrl} className="max-h-[80vh]" />
                        ) : (
                            <iframe src={previewUrl} className="w-full h-[80vh]" />
                        )}
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setShowPasswordModal(false)}   // click outside closes
                >
                    <div
                        className="bg-white p-6 rounded-xl w-80 space-y-4 relative"
                        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
                    >

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={closePasswordModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <FiX />
                        </button>

                        <h3 className="text-lg font-semibold">Enter Password</h3>

                        <div className="relative">
                            <input
                                ref={passwordRef}
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border p-2 rounded pr-10"
                                placeholder="Password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPass(prev => !prev)}
                                className="absolute right-2 top-2 text-sm text-gray-500"
                            >
                                {showPass ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button
                            onClick={handleUnlock}
                            disabled={unlockLoading}
                            className="w-full bg-indigo-600 text-white py-2 rounded flex justify-center"
                        >
                            {unlockLoading ? (
                                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                            ) : (
                                "Unlock"
                            )}
                        </button>

                    </div>
                </div>
            )}

            {showLockModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80 space-y-4">

                        <button
                            onClick={closePasswordModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <FiX />
                        </button>
                        <h3 className="text-lg font-semibold">Set Password</h3>

                        <input
                            type="password"
                            value={lockPassword}
                            onChange={(e) => setLockPassword(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Enter password"
                        />

                        <button
                            onClick={confirmLock}
                            disabled={lockLoading}
                            className="w-full bg-red-600 text-white py-2 rounded flex justify-center"
                        >
                            {lockLoading ? (
                                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                            ) : (
                                "Lock Document"
                            )}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentsPage;