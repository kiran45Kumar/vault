import { useState } from "react";
import api from "../api/axios";
// import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
function UploadDocument() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  if (!token) {
    navigate("/");
    return <p>Please log in to upload documents. <a href="/">Login here</a></p>;
  }
  // const decoded = jwtDecode(token);
  // const email = decoded.email;
  const handleUpload = async () => {
    if (!file || !title || !category) {
      alert("Fill all fields!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category_name", category);

    const token = JSON.parse(localStorage.getItem("token"));

    try {
      await api.post("/documents/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Uploaded successfully!");
      setFile(null);
      setTitle("");
      setCategory("");
      setDescription("");
    } catch (error) {
      console.log(error);
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white shadow px-8 py-4">
        <h1 className="text-xl font-bold">Vault Dashboard</h1>

        {/* User icon */}
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            U
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {/* Top Navbar */}

        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Upload Document</h2>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="border border-gray-300 rounded-lg p-2"
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>
      </div>
    </>

  );
}

export default UploadDocument;
