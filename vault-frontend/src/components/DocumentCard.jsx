import { FiMoreVertical, FiLock } from "react-icons/fi";

function DocumentCard({ doc }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white shadow active:scale-95 transition">
      
      {/* Thumbnail */}
      <div className="h-32 bg-gray-200 relative">
        {doc.is_locked && (
          <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center">
            <FiLock className="text-white text-xl" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate">{doc.title}</p>
      </div>

      {/* Menu */}
      <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
        <FiMoreVertical size={16} />
      </button>
    </div>
  );
}

export default DocumentCard;