import dayjs from "dayjs";
import DocumentCard from "./DocumentCard";

function groupByDate(docs) {
  const groups = { Today: [], Yesterday: [], Older: [] };

  docs.forEach((doc) => {
    const d = dayjs(doc.created_at);

    if (d.isSame(dayjs(), "day")) groups.Today.push(doc);
    else if (d.isSame(dayjs().subtract(1, "day"), "day"))
      groups.Yesterday.push(doc);
    else groups.Older.push(doc);
  });

  return groups;
}

function DocumentGrid({ docs }) {
  const grouped = groupByDate(docs);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([label, items]) => {
        if (!items.length) return null;

        return (
          <div key={label}>
            <h2 className="text-sm font-semibold text-gray-600 mb-2">
              {label}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DocumentGrid;