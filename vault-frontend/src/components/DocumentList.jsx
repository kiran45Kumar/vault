import api from "../api/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { FiFileText, FiImage, FiFile, FiTrash2, FiEye, FiX } from "react-icons/fi";
import { useState } from "react";
function DocumentList({ docs, setDocs, loading, setLoading }) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [unlockToken, setUnlockToken] = useState({});
  const [loadingView, setLoadingView] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleView = async (doc, tokenMap = unlockToken) => {
    setLoadingView(true);

    try {
      const res = await api.get(`/documents/${doc.id}/view/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
          ...(tokenMap?.[doc.id]
            ? { "X-Unlock-Token": tokenMap[doc.id] }
            : {})
        }
      });

      const files = res.data.files || [];

      if (files.length === 0) {
        toast.error("No files found");
        return;
      }

      // 👉 OPEN FIRST FILE (quick view fallback)
      window.open(files[0].file_url, "_blank");

      // OPTIONAL (better UX):
      // instead of opening just 1 file, open modal viewer here

    } catch (err) {
      if (err.response?.data?.locked) {
        setSelectedDoc(doc);
        setShowModal(true);
      } else {
        toast.error("Failed to open document");
      }
    } finally {
      setLoadingView(false);
    }
  };


  const handleUnlock = async () => {
    setLoadingView(true);

    try {
      const res = await api.post(
        `/documents/${selectedDoc.id}/unlock/`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const token = res.data.unlock_token;

      // create updated token map FIRST
      const updatedTokens = {
        ...unlockToken,
        [selectedDoc.id]: token
      };

      setUnlockToken(updatedTokens);

      setShowModal(false);
      setPassword("");

      toast.success("Unlocked 🔓");

      // 🔥 IMPORTANT: pass fresh token directly (NOT state)
      handleView(selectedDoc, updatedTokens);

    } catch {
      toast.error("Wrong password");
    } finally {
      setLoadingView(false);
    }
  };
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await api.delete(`/documents/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDocs((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.log(err.response); // debug

      if (err.response && err.response.data) {
        const errors = err.response.data;

        // Loop through backend errors
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key][0]); // show first error
        });
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // 📄 FILE TYPE ICON
  const getIcon = (file) => {
    if (!file) return <FiFile />;
    if (file.endsWith(".pdf")) return <FiFileText className="text-red-500" />;
    if (file.match(/\.(jpg|jpeg|png)$/))
      return <FiImage className="text-green-500" />;
    return <FiFile className="text-gray-500" />;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h3 className="font-semibold text-gray-800 text-base md:text-lg">
          Recent Documents
        </h3>

        <Link to="/dashboard/documents" className="hidden md:inline-block">
          <span className="text-indigo-600 text-xs md:text-sm cursor-pointer hover:underline">
            View All
          </span>
        </Link>
      </div>

      {/* EMPTY */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading documents...
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">

          {docs.map((doc) => {
            const isImageFile =
              doc.files?.[0]?.file_url?.includes(".jpg") ||
              doc.files?.[0]?.file_url?.includes(".jpeg") ||
              doc.files?.[0]?.file_url?.includes(".png") ||
              doc.files?.[0]?.file_url?.includes(".webp");

            return (
              <div
                key={doc.id}
                className="
        group
        bg-white
        border
        border-gray-200
        rounded-2xl
        overflow-hidden
        hover:border-indigo-300
        hover:shadow-lg
        transition-all duration-300
      "
              >

                {/* IMAGE PREVIEW */}
                {isImageFile ? (
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className={`
    w-full
    h-full
    object-cover
    transition-all duration-500
    group-hover:scale-105
    ${doc.is_locked ? "blur-2xl brightness-50" : ""}
  `}
                    />

                    {/* LOCK OVERLAY */}
                    {doc.is_locked && (
                      <div className="
              absolute inset-0
              flex items-center justify-center
            ">
                        <div className="
                bg-white/90
                backdrop-blur-md
                p-4
                rounded-full
                shadow-2xl
              ">
                          <span className="text-2xl">🔒</span>
                        </div>
                      </div>
                    )}

                    {/* TOP GRADIENT */}
                    <div className="
            absolute inset-0
            bg-linear-to-t
            from-black/70
            via-black/10
            to-transparent
          " />

                    {/* BOTTOM INFO */}
                    <div className="
            absolute bottom-0 left-0 right-0
            p-4
            text-white
          ">
                      <p className="
              text-sm
              font-semibold
              truncate
            ">
                        {doc.title}
                      </p>

                      <p className="text-xs text-white/80 mt-1">
                        {doc.category_display}
                      </p>

                      <div className="
              flex justify-between items-center
              mt-4
            ">

                        {doc.files?.length > 0 && (
                          <button
                            onClick={() => handleView(doc)}
                            className="
      flex items-center gap-1
      text-indigo-600
      hover:underline
    "
                          >
                            <FiEye />
                            View
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="
                  flex items-center gap-1
                  text-xs
                  bg-red-500/20
                  hover:bg-red-500/30
                  text-red-100
                  px-3 py-2
                  rounded-xl
                  transition-all
                "
                        >
                          <FiTrash2 />
                          Delete
                        </button>

                      </div>
                    </div>
                  </div>
                ) : (

                  /* NORMAL CARD FOR PDF / FILES */
                  <div className="p-4">

                    {/* ICON */}
                    <div className="
            text-3xl mb-3
            flex items-center justify-center
          ">
                      {getIcon(doc.file_url)}
                    </div>

                    {/* TITLE */}
                    <p className="
            text-sm
            font-medium
            text-gray-800
            truncate
            text-center
          ">
                      {doc.title}
                    </p>

                    {/* CATEGORY */}
                    <p className="
            text-xs
            text-gray-500
            mt-1
            text-center
          ">
                      {doc.category_display}
                    </p>

                    {/* LOCK STATUS */}
                    <p className="
            text-xs
            text-center
            mt-1
          ">
                      {doc.is_locked
                        ? "🔒 Locked"
                        : "🔓 Unlocked"}
                    </p>

                    {/* DATE */}
                    <p className="
            text-xs
            text-gray-400
            mt-1
            text-center
          ">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                        : "Recently added"}
                    </p>

                    {/* ACTIONS */}
                    <div
                      className="
              flex justify-between items-center
              mt-4 text-xs
              opacity-100
              md:opacity-0
              md:group-hover:opacity-100
              transition
            "
                    >

                      {doc.files?.length > 0 && (
                        <button
                          onClick={() => handleView(doc)}
                          className="
      flex items-center gap-1
      text-xs
      bg-white/10
      hover:bg-white/20
      backdrop-blur-md
      px-3 py-2
      rounded-xl
      transition-all
    "
                        >
                          <FiEye />
                          View
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="
                flex items-center gap-1
                text-red-500
                hover:underline
              "
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-80 space-y-4">

                <button
                  onClick={() => setShowModal(false)}
                  className="ml-auto flex items-center"
                >
                  <FiX />
                </button>
                <h3 className="text-lg font-semibold">Enter Password</h3>

                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded pr-10"
                    placeholder="Password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-2 top-2 text-xs text-gray-500"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  onClick={handleUnlock}
                  disabled={loadingView}
                  className="w-full bg-indigo-600 text-white py-2 rounded flex justify-center"
                >
                  {loadingView ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                  ) : (
                    "Unlock & View"
                  )}
                </button>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
