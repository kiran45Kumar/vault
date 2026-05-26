import { useState } from "react";
import api from "../api/axios";
import { FiUploadCloud } from "react-icons/fi";
import {
  showSuccess,
  showError,
  showLoading,
  dismissToast,
} from "../utils/toast";
function UploadDocument({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!files.length || !title || !category) {

      showError("File, Title and Category are required");

      return;
    }

    setLoading(true);

    const loadingToast = showLoading("Uploading files...");

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("title", title);
    formData.append("category_name", category);
    formData.append("description", description);

    const token = localStorage.getItem("token");

    try {

      await api.post("/documents/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dismissToast(loadingToast);

      showSuccess("Uploaded successfully!");

      setFiles([]);
      setTitle("");
      setCategory("");
      setDescription("");

      onUpload();

    } catch (err) {

      dismissToast(loadingToast);

      console.log(err.response);

      if (err.response && err.response.data) {

        const errors = err.response.data;

        Object.keys(errors).forEach((key) => {

          showError(errors[key][0]);

        });

      } else {

        showError("Something went wrong");
      }

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-r-gray-500 shadow-md">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Upload Document
        </h2>
        <p className="text-sm text-gray-500">
          Add your documents securely to your vault
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6 items-center">

        {/* LEFT - INPUTS */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Aadhaar Card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Identity"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              placeholder="Optional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* RIGHT - UPLOAD BOX */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 transition">

          <FiUploadCloud className="text-4xl text-indigo-500 mb-3" />

          <p className="text-gray-700 font-medium">
            Drag & drop files here
          </p>

          <p className="text-gray-400 text-sm mb-4">or</p>

          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm cursor-pointer hover:bg-indigo-700 shadow"
          >
            Choose Files
          </label>

          <p className="text-xs text-gray-400 mt-3">
            PDF, JPG, PNG, DOC, DOCX (Max: 10MB)
          </p>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* BUTTON */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

    </div>
  );
}

export default UploadDocument;
