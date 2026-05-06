function ViewToggle({ view, setView }) {
  return (
    <div className="bg-gray-100 rounded-xl p-1 flex">
      <button
        onClick={() => setView("grid")}
        className={`px-3 py-1 rounded-lg text-sm ${
          view === "grid" ? "bg-white shadow" : ""
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setView("list")}
        className={`px-3 py-1 rounded-lg text-sm ${
          view === "list" ? "bg-white shadow" : ""
        }`}
      >
        List
      </button>
    </div>
  );
}

export default ViewToggle;