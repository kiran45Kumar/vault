import api from "../api/axios";
import { toast } from "react-toastify";
import { FiFileText, FiImage, FiFile, FiTrash2, FiEye } from "react-icons/fi";

function DocumentList({ docs, setDocs, loading, setLoading }) {
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
    } catch {
      toast.error("Delete failed");
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
    <div className="bg-white p-6 rounded-2xl shadow-md">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-semibold text-gray-800 text-lg">
          Recent Documents
        </h3>

        <span className="text-indigo-600 text-sm cursor-pointer hover:underline">
          View All
        </span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* ICON */}
              <div className="text-3xl mb-3 flex items-center justify-center">
                {getIcon(doc.file_url)}
              </div>

              {/* TITLE */}
              <p className="text-sm font-medium text-gray-800 truncate flex items-center justify-center">
                {doc.title}
              </p>

              {/* CATEGORY */}
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                {doc.category_display}
              </p>

              {/* META (fake for now, you can replace later) */}
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center">
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                  : "Recently added"}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-4 text-xs opacity-0 group-hover:opacity-100 transition">
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <FiEye /> View
                  </a>
                )}

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex items-center gap-1 text-red-500 hover:underline"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
