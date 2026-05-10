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
    FiX,
    FiPlus,
    FiMinus,
    FiRotateCcw,
    FiEdit,
    FiMoreVertical,
    FiGrid,
    FiList,
} from "react-icons/fi";

import { SlLock } from "react-icons/sl";
import { bulkMoveToTrash, bulkRestore, bulkPermanentDelete } from "../services/documentService";
import { useSwipeable } from "react-swipeable";
import { toast } from "react-toastify";

function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    // const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [previewIndex, setPreviewIndex] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [unlockLoading, setUnlockLoading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editDoc, setEditDoc] = useState(null);

    const [showTrash, setShowTrash] = useState(false);

    const [editForm, setEditForm] = useState({
        title: "",
        category: "",
        description: "",
        file: null
    });


    const [selectedDocs, setSelectedDocs] = useState([]);
    const toggleSelect = (id) => {
        setSelectedDocs(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const isSelected = (id) => selectedDocs.includes(id);

    const [editLoading, setEditLoading] = useState(false);

    const openEditModal = (doc) => {
        setEditDoc(doc);
        setEditForm({
            title: doc.title || "",
            category: doc.category_display || "",
            description: doc.description || "",
            file: null
        });
        setShowEditModal(true);
    };



    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setEditForm((prev) => ({
            ...prev,
            file: e.target.files[0]
        }));
    };

    const handleEditSubmit = async () => {
        setEditLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", editForm.title);
            formData.append("category_name", editForm.category);
            formData.append("description", editForm.description);

            if (editForm.file) {
                formData.append("file", editForm.file);
            }

            await api.patch(`/documents/${editDoc.id}/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Updated successfully");

            setShowEditModal(false);
            setEditDoc(null);

            fetchDocs();

        } catch (err) {
            toast.error("Update failed", err);
        } finally {
            setEditLoading(false);
        }
    };

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

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [showPermanentModal, setShowPermanentModal] = useState(false);
    const [permanentDocId, setPermanentDocId] = useState(null);
    const [permanentLoading, setPermanentLoading] = useState(false);
    const [view, setView] = useState("grid");

    // const [categoryFilter, setCategoryFilter] = useState("");
    // const [dateFilter, setDateFilter] = useState(""); // today / week / month

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        date: "",
        sort: "desc",
        sortField: "created_at",
    });


    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 1));
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - start.x,
            y: e.clientY - start.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const passwordRef = useRef(null);

    const [unlockToken, setUnlockToken] = useState({});
    const itemsPerPage = 5;
    const [reloadLoading, setReloadLoading] = useState(false);
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");
    const fetchDocs = async () => {
        setReloadLoading(true);
        try {
            const url = showTrash ? "/documents/trash/" : "/documents/";
            const res = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDocs(res.data.results || res.data || []);
        } catch (err) {
            toast.error("Failed to load documents", err);
            setReloadLoading(false);
        }
        finally {
            setReloadLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [showTrash]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDocId, setDeleteDocId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const toggleMenu = (id) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    useEffect(() => {
        const handleClick = () => setOpenMenuId(null);
        window.addEventListener("click", handleClick);

        return () => window.removeEventListener("click", handleClick);
    }, []);

    const openDeleteModal = (id) => {
        setDeleteDocId(id);
        setShowDeleteModal(true);
    };
    const confirmDelete = async () => {
        setDeleteLoading(true);

        try {
            await api.delete(`/documents/${deleteDocId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDocs((prev) => prev.filter((doc) => doc.id !== deleteDocId));

            toast.success("Deleted successfully ");
            setShowDeleteModal(false);
            setDeleteDocId(null);

        } catch {
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.patch(`/documents/${id}/restore/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Restored ♻️");
            fetchDocs();

        } catch {
            toast.error("Restore failed");
        }
    };

    const confirmPermanentDelete = async () => {
        setPermanentLoading(true);

        try {
            await api.delete(`/documents/${permanentDocId}/permanent_delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Deleted permanently 🗑️");
            setShowPermanentModal(false);
            setPermanentDocId(null);
            fetchDocs();

        } catch {
            toast.error("Failed to delete");
        } finally {
            setPermanentLoading(false);
        }
    };

    // const handlePermanentDelete = async (id) => {
    //     if (!window.confirm("Delete permanently?")) return;

    //     try {
    //         await api.delete(`/documents/${id}/permanent_delete/`, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });

    //         toast.success("Deleted permanently 🗑️");
    //         fetchDocs();

    //     } catch {
    //         toast.error("Failed");
    //     }
    // };

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
        console.log(lockPassword)
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
    const formatDate = (date) => {
        const d = new Date(date);
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    };
    const processedDocs = docs
        .filter((doc) => {
            const searchMatch = (doc.title || "")
                .toLowerCase()
                .includes(filters.search.toLowerCase());

            const categoryMatch = filters.category
                ? doc.category_display === filters.category
                : true;

            const dateMatch = filters.date
                ? formatDate(doc.created_at) === filters.date
                : true;

            return searchMatch && categoryMatch && dateMatch;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            return filters.sort === "asc"
                ? dateA - dateB   // oldest first
                : dateB - dateA;  // newest first
        });

    const totalPages = Math.ceil(processedDocs.length / itemsPerPage);
    const paginatedDocs = processedDocs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

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


    const handleBulkMoveToTrash = async () => {
        try {
            await bulkMoveToTrash(selectedDocs, token);

            toast.success("Selected documents moved to trash");
            setSelectedDocs([]);
            fetchDocs();

        } catch {
            toast.error("Failed to move selected docs");
        }
    };


    const handleBulkRestore = async () => {
        try {
            await bulkRestore(selectedDocs, token);

            toast.success("Restored selected documents");
            setSelectedDocs([]);
            fetchDocs();

        } catch {
            toast.error("Restore failed");
        }
    };

    const handleBulkPermanentDelete = async () => {
        try {
            await bulkPermanentDelete(selectedDocs, token);

            toast.success("Deleted permanently");
            setSelectedDocs([]);
            fetchDocs();

        } catch {
            toast.error("Permanent delete failed");
        }
    };

    // const uniqueCategories = [
    //     ...new Set(docs.map((doc) => doc.category_display).filter(Boolean))
    // ].sort();
    const isImage = (url) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };
    if (!token) return <Navigate to="/login" replace />;

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                    My Documents
                </h2>
                <p className="text-sm text-gray-500">
                    Manage and preview your files
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowTrash(false)}
                    className={`px-4 py-2 rounded-xl text-sm ${!showTrash ? "bg-indigo-600 text-white" : "bg-gray-100"
                        }`}
                >
                    Documents
                </button>

                <button
                    onClick={() => setShowTrash(true)}
                    className={`px-4 py-2 rounded-xl text-sm ${showTrash ? "bg-red-600 text-white" : "bg-gray-100"
                        }`}
                >
                    Trash
                </button>
            </div>

            <div className="flex justify-end">
                <div className="bg-gray-100 rounded-xl p-1 flex">
                    {/* GRID */}
                    <button
                        onClick={() => setView("grid")}
                        className={`
      p-2 rounded-lg transition-all
      ${view === "grid"
                                ? "bg-white shadow text-indigo-600"
                                : "text-slate-500 hover:text-slate-700"}
    `}
                    >
                        <FiGrid size={18} />
                    </button>

                    {/* LIST */}
                    <button
                        onClick={() => setView("list")}
                        className={`
      p-2 rounded-lg transition-all
      ${view === "list"
                                ? "bg-white shadow text-indigo-600"
                                : "text-slate-500 hover:text-slate-700"}
    `}
                    >
                        <FiList size={18} />
                    </button>
                </div>
            </div>
            {/* 🔥 FULL WIDTH FILTER BAR */}
            <div className="w-full bg-white/80 backdrop-blur-md p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200/60 space-y-5 mb-6">

                {/* TOP ROW: Search & Sort */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                    {/* 🔍 SEARCH */}
                    {/* 👇 hidden autofill trap */}
                    <input type="text" name="fake-user" autoComplete="username" className="hidden" />
                    <input type="password" name="fake-pass" autoComplete="current-password" className="hidden" />

                    <div className="relative w-full md:flex-1 group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-600">
                            <FiSearch className="w-5 h-5 text-slate-400" />
                        </div>

                        <input
                            type="search"
                            name="vault-search-q"              // 🔑 avoid email/username keywords
                            autoComplete="new-password"        // 🔑 trick Chrome
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            inputMode="search"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, search: e.target.value }))
                            }
                            placeholder="Search documents..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm transition-all
        placeholder:text-slate-400
        focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* 🔄 SORT */}
                    <div className="relative w-full md:w-44">
                        <select
                            value={filters.sort}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, sort: e.target.value }))
                            }
                            className="w-full appearance-none bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-all
                focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none cursor-pointer"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center pt-2 border-t border-slate-100">

                    <div className="flex flex-1 flex-col md:flex-row gap-3">

                        {/* CATEGORY */}
                        <div className="w-full md:w-56">
                            <select
                                value={filters.category}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, category: e.target.value }))
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {[...new Set(docs.map(d => d.category_display).filter(Boolean))].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* DATE */}
                        <div className="w-full md:w-48">
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, date: e.target.value }))
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* RESET */}
                    <button
                        onClick={() =>
                            setFilters({
                                search: "",
                                category: "",
                                date: "",
                                sort: "desc"
                            })
                        }
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <FiRotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>

                    <button
                        onClick={fetchDocs}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <FiRotateCcw className="w-3.5 h-3.5" />
                        {reloadLoading ? (
                            <span className="animate-spin border-2 border-slate-500 border-t-transparent rounded-full w-4 h-4"></span>
                        ) : (
                            "Refresh"
                        )}
                    </button>
                </div>
            </div>

            {/* MOBILE VIEW */}
            {view === "grid" && (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {paginatedDocs.map((doc, index) => (
                        <div
                            key={doc.id}
                            onClick={() => {
                                setSelectedDoc(doc);
                                setShowDetailsModal(true);
                            }}
                            className={`
                    group relative bg-white rounded-2xl border transition-all duration-300
                    cursor-pointer hover:shadow-xl flex flex-col overflow-hidden
                    ${isSelected(doc.id)
                                    ? "border-indigo-500 ring-4 ring-indigo-50"
                                    : "border-slate-200 shadow-sm hover:border-slate-300"}
                `}
                        >
                            {/* 🖼️ PREVIEW AREA (Responsive Aspect Ratio) */}
                            <div className="aspect-4/3 h-80 w-full relative overflow-hidden bg-slate-50 border-b border-slate-100">
                                {isImage(doc.file_url) ? (
                                    <img
                                        src={doc.file_url}
                                        alt={doc.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                            <span className="text-4xl">📄</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {getType(doc.file_url)}
                                        </span>
                                    </div>
                                )}

                                {/* 🔒 LOCK OVERLAY */}
                                {doc.is_locked && (
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center text-white">
                                        <div className="bg-white p-3 rounded-full shadow-2xl scale-110">
                                            <SlLock className="text-slate-900 text-lg" />
                                        </div>
                                    </div>
                                )}

                                {/* 🔝 ACTIONS (Visible on Mobile, Hover on Desktop) */}
                                <div className="absolute top-2 left-2 right-2 flex justify-between items-start lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <input
                                        type="checkbox"
                                        checked={isSelected(doc.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggleSelect(doc.id)}
                                        className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                    />

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(doc.id);
                                            }}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-md border
                                    ${openMenuId === doc.id
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-white/90 backdrop-blur-md border-white/20 text-slate-700'}`}
                                        >
                                            <FiMoreVertical size={20} />
                                        </button>

                                        {openMenuId === doc.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); toggleMenu(null); }} />
                                                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                                                    <MenuAction icon={<FiEye />} label="View" onClick={() => openPreview(doc, index)} />
                                                    <MenuAction icon={<FiDownload />} label="Download" onClick={() => openPreview(doc, index)} border />
                                                    <MenuAction icon={<FiEdit />} label="Edit" onClick={() => openEditModal(doc)} color="text-blue-600" />
                                                    {!doc.is_locked && (
                                                        <MenuAction icon={<SlLock />} label="Lock" onClick={() => openLockModal(doc.id)} color="text-yellow-600" />
                                                    )}
                                                    <MenuAction icon={<FiTrash2 />} label="Delete" onClick={() => openDeleteModal(doc.id)} color="text-red-600" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 🔽 METADATA */}
                            <div className="p-4 bg-white">
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 leading-tight">
                                        {doc.title || "Untitled Document"}
                                    </h3>
                                    <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${doc.is_locked ? "bg-amber-400" : "bg-emerald-400"}`} />
                                </div>

                                <div className="flex items-center gap-2 text-[12px] text-slate-500">
                                    <span>{new Date(doc.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                                    <span className="opacity-30">•</span>
                                    <span className={`font-semibold ${doc.is_locked ? "text-amber-600" : "text-emerald-600"}`}>
                                        {doc.is_locked ? "Locked" : "Active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {view === "list" && (
                <div className="md:hidden space-y-3 p-3">
                    {paginatedDocs.map((doc, index) => (
                        <div
                            key={doc.id}
                            onClick={() => {
                                setSelectedDoc(doc);
                                setShowDetailsModal(true);
                            }}
                            className={`
          bg-white rounded-xl border shadow-sm p-4 transition
          ${isSelected(doc.id) ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}
        `}
                        >
                            {/* 🔝 TOP SECTION */}
                            <div className="flex items-start gap-3">

                                {/* ✅ CHECKBOX */}
                                <input
                                    type="checkbox"
                                    checked={isSelected(doc.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => toggleSelect(doc.id)}
                                    className="mt-1 w-5 h-5 accent-indigo-600 cursor-pointer"
                                />

                                {/* 📄 CONTENT */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                        {doc.title || "Untitled Document"}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {doc.category_display}
                                    </p>

                                    {/* 🔒 STATUS */}
                                    <p className={`text-xs mt-1 font-medium ${doc.is_locked ? "text-amber-600" : "text-emerald-600"}`}>
                                        {doc.is_locked ? "🔒 Locked" : "🔓 Active"}
                                    </p>
                                </div>

                                {/* 📌 FILE TYPE */}
                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                    {getType(doc.file_url)}
                                </span>
                            </div>

                            {/* 📅 DATE */}
                            <p className="text-[11px] text-slate-400 mt-2 ml-8">
                                {new Date(doc.created_at).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </p>

                            {/* ⚡ ACTIONS */}
                            <div className="grid grid-cols-5 gap-2 mt-4 text-xs text-slate-600">

                                {!showTrash ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPreview(doc, index);
                                            }}
                                            className="flex flex-col items-center gap-1 hover:text-indigo-600"
                                        >
                                            <FiEye size={16} />
                                            View
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPreview(doc, index);
                                            }}
                                            className="flex flex-col items-center gap-1 hover:text-indigo-600"
                                        >
                                            <FiDownload size={16} />
                                            Download
                                        </button>

                                        {!doc.is_locked && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openLockModal(doc.id);
                                                }}
                                                className="flex flex-col items-center gap-1 hover:text-yellow-600"
                                            >
                                                <SlLock size={16} />
                                                Lock
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(doc);
                                            }}
                                            className="flex flex-col items-center gap-1 hover:text-blue-600"
                                        >
                                            <FiEdit size={16} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(doc.id);
                                            }}
                                            className="flex flex-col items-center gap-1 hover:text-red-600"
                                        >
                                            <FiTrash2 size={16} />
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(doc.id);
                                            }}
                                            className="col-span-2 text-green-600 flex flex-col items-center"
                                        >
                                            ♻️ Restore
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPermanentDocId(doc.id);
                                                setShowPermanentModal(true);
                                            }}
                                            className="col-span-3 text-red-600 flex flex-col items-center"
                                        >
                                            🗑 Delete Forever
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* DESKTOP TABLE */}
            {view === "list" && (
                <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
                    <table className="w-full text-sm min-w-175">

                        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={
                                            paginatedDocs.length > 0 &&
                                            selectedDocs.length === paginatedDocs.length
                                        }
                                        onClick={(e) => e.stopPropagation()}   // ✅ ADD THIS
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDocs(paginatedDocs.map(d => d.id));
                                            } else {
                                                setSelectedDocs([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th onClick={() => handleSort("title")} className="px-6 py-4 text-left cursor-pointer">Name</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th onClick={() => handleSort("created_at")} className="px-6 py-4 text-left cursor-pointer">Date</th>
                                <th onClick={() => handleSort("updated_at")} className="px-6 py-4 text-left cursor-pointer">Last Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedDocs.map((doc, index) => (
                                <tr key={doc.id} onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowDetailsModal(true);
                                }}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="hover:bg-gray-50 cursor-pointer transition">

                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected(doc.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleSelect(doc.id)}
                                        />
                                    </td>
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
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(doc.updated_at).toLocaleString("en-IN", {
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

                                            {!showTrash ? (
                                                <>
                                                    <Tooltip text="View">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPreview(doc, index)
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <FiEye />
                                                        </button>
                                                    </Tooltip>

                                                    <Tooltip text="Download">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPreview(doc, index);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <FiDownload />
                                                        </button>
                                                    </Tooltip>

                                                    {!doc.is_locked && (
                                                        <Tooltip text="Lock document">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openLockModal(doc.id);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-yellow-100"
                                                            >
                                                                <SlLock />
                                                            </button>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip text="Edit">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(doc);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                    </Tooltip>

                                                    <Tooltip text="Move to Trash">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteModal(doc.id);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <><Tooltip text="Restore document">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRestore(doc.id);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-green-100 text-green-600"
                                                    >
                                                        ♻️
                                                    </button>
                                                </Tooltip>

                                                    <Tooltip text="Delete permanently">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPermanentDocId(doc.id);
                                                                setShowPermanentModal(true);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                                                        >
                                                            🗑
                                                        </button>
                                                    </Tooltip>
                                                </>
                                            )}

                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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

                    {/* ❌ CLOSE BUTTON */}
                    <button
                        onClick={() => setPreviewIndex(null)}
                        className="absolute top-4 right-4 text-white text-2xl"
                    >
                        <FiX />
                    </button>

                    {/* 📄 PREVIEW */}
                    <div {...handlers} className="w-full flex justify-center px-4">
                        {loadingPreview ? (
                            <div className="text-white text-sm animate-pulse">
                                Loading document...
                            </div>
                        ) : previewUrl?.match(/\.(jpg|png|jpeg)$/i) ? (

                            // 👇 ZOOM WRAPPER HERE
                            <div
                                className="relative overflow-hidden"
                                onWheel={handleWheel}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    src={previewUrl}
                                    onMouseDown={handleMouseDown}
                                    className="max-h-[80vh] cursor-grab select-none"
                                    style={{
                                        transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
                                    }}
                                    draggable={false}
                                />
                            </div>

                        ) : (
                            <iframe src={previewUrl} className="w-full h-[80vh]" />
                        )}
                    </div>

                    {/* 🔥 ADD HERE (BOTTOM CENTER) */}
                    <div className="absolute bottom-6 flex gap-3 bg-black/60 p-3 rounded-xl text-white">
                        <button onClick={handleZoomIn}>➕</button>
                        <button onClick={handleZoomOut}>➖</button>
                        <button onClick={handleReset}>Reset</button>
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
                            onClick={() => setShowLockModal(false)}
                            className="ml-auto flex items-center justify-end"
                        >
                            <FiX />
                        </button>
                        <h3 className="text-lg font-semibold">Set Password</h3>

                        <div className="relative">
                            <input
                                ref={passwordRef}
                                type={showPass ? "text" : "password"}
                                value={lockPassword}
                                onChange={(e) => setLockPassword(e.target.value)}
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

            {showEditModal && (
                <div onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSubmit();
                }}
                    tabIndex={0} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 relative">

                        {/* CLOSE */}
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-500"
                        >
                            <FiX />
                        </button>

                        <h3 className="text-lg font-semibold">Edit Document</h3>

                        {/* TITLE */}
                        <input
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            placeholder="File name"
                            className="w-full border p-2 rounded-lg"
                        />

                        {/* CATEGORY */}
                        <input
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                            placeholder="Category"
                            className="w-full border p-2 rounded-lg"
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            placeholder="Description"
                            className="w-full border p-2 rounded-lg"
                            rows={3}
                        />

                        {/* FILE */}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full text-sm"
                        />

                        <p className="text-xs text-gray-500">
                            Current: {editDoc?.file_url?.split("/").pop()}
                        </p>
                        {/* ACTIONS */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleEditSubmit}
                                disabled={editLoading}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex justify-center"
                            >
                                {editLoading ? (
                                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 border py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div onKeyDown={(e) => {
                    if (e.key === "Enter") confirmDelete();
                }}
                    tabIndex={0} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

                    <div className="bg-white rounded-2xl p-6 w-80 space-y-4 text-center">

                        <h3 className="text-lg font-semibold text-gray-800">
                            Delete Document
                        </h3>

                        <p className="text-sm text-gray-500">
                            The document will be moved to <span className="font-medium text-indigo-600">Trash</span>.
                            You can restore it unless it is permanently deleted.
                        </p>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 border py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg flex justify-center"
                            >
                                {deleteLoading ? (
                                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {showPermanentModal && (
                <div onKeyDown={(e) => {
                    if (e.key === "Enter") confirmPermanentDelete();
                }}
                    tabIndex={0} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

                    <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md space-y-4 text-center">

                        {/* TITLE */}
                        <h3 className="text-lg font-semibold text-red-600">
                            Delete Permanently
                        </h3>

                        {/* MESSAGE */}
                        <p className="text-sm text-gray-600">
                            This action <span className="font-semibold text-red-500">cannot be undone</span>.
                            The document will be permanently deleted from storage.
                        </p>

                        {/* ACTIONS */}
                        <div className="flex gap-3 mt-4">

                            <button
                                onClick={() => setShowPermanentModal(false)}
                                className="flex-1 border py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmPermanentDelete}
                                disabled={permanentLoading}
                                onKeyDown={(e) => e.key === 'Enter' && confirmPermanentDelete()}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg flex justify-center"
                            >
                                {permanentLoading ? (
                                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                                ) : (
                                    "Delete Forever"
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedDoc && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Document Details
                            </h3>

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-black"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="space-y-3 text-sm">

                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium text-gray-800">
                                    {selectedDoc.title}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Category</p>
                                <p className="font-medium text-gray-800">
                                    {selectedDoc.category_display || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-medium text-gray-800">
                                    {getType(selectedDoc.file_url)}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-medium">
                                    {selectedDoc.is_locked ? (
                                        <span className="text-red-500">🔒 Locked</span>
                                    ) : (
                                        <span className="text-green-500">🔓 Unlocked</span>
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(selectedDoc.created_at).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Last Updated</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(selectedDoc.updated_at).toLocaleString("en-IN")}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">File</p>
                                <p className="text-indigo-600 text-xs break-all">
                                    {selectedDoc.file_url?.split("/").pop()}
                                </p>
                            </div>

                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-4 border-t">

                            <button
                                onClick={() => {
                                    openPreview(selectedDoc, 0);
                                    setShowDetailsModal(false);
                                }}
                                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg"
                            >
                                View
                            </button>

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-sm border rounded-lg"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {selectedDocs.length > 0 && (
                <div className="
        fixed bottom-4 left-1/2 -translate-x-1/2 
        w-[92%] sm:w-auto
        bg-white shadow-xl border rounded-2xl 
        px-4 py-3 
        flex flex-col sm:flex-row 
        items-center justify-between 
        gap-3 sm:gap-4 
        z-50
    ">

                    {/* COUNT */}
                    <span className="text-sm font-semibold text-gray-700">
                        {selectedDocs.length} selected
                    </span>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center justify-center gap-3">

                        {!showTrash ? (
                            <button
                                onClick={handleBulkMoveToTrash}
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs sm:text-sm font-medium hover:bg-red-100 transition"
                            >
                                Move to Trash
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleBulkRestore}
                                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs sm:text-sm font-medium hover:bg-green-100 transition"
                                >
                                    Restore
                                </button>

                                <button
                                    onClick={handleBulkPermanentDelete}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs sm:text-sm font-medium hover:bg-red-100 transition"
                                >
                                    Delete Forever
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setSelectedDocs([])}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

const Tooltip = ({ text, children }) => (
    <div className="relative group flex items-center ">

        {children}

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
            whitespace-nowrap px-2 py-1 text-xs rounded-md bg-gray-900 text-white
            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
            transition-all pointer-events-none z-50">
            {text}
        </div>
    </div>
);

const MenuAction = ({ icon, label, onClick, color = "text-slate-700", border }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors ${color} ${border ? 'border-b border-slate-100' : ''}`}
    >
        <span className="text-lg">{icon}</span> {label}
    </button>
)
export default DocumentsPage;