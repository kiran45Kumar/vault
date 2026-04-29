import UploadDocument from "../components/UploadDocument";

function UploadPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Upload Document
      </h2>

      <UploadDocument />
    </div>
  );
}

export default UploadPage;