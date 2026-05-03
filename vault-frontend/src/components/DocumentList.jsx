import api from "../api/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
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

          {docs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >

              {/* ICON */}
              <div className="text-3xl mb-3 flex items-center justify-center">
                {getIcon(doc.file_url)}
              </div>

              {/* TITLE */}
              <p className="text-sm font-medium text-gray-800 truncate text-center">
                {doc.title}
              </p>

              {/* CATEGORY */}
              <p className="text-xs text-gray-500 mt-1 text-center">
                {doc.category_display}
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-400 mt-1 text-center">
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "Recently added"}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-4 text-xs 
              opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
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
