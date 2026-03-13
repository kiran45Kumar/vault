import { useState } from "react";
import api from "../api/axios";

function UploadDocument() {

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const[loading, setLoading] = useState(false);

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

    const token = localStorage.getItem("token");

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
      setLoading(false);
    } catch (error) {
      console.log(error);
      alert("Upload failed!");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Upload Document</h3>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default UploadDocument;