import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";

function Dashboard() {
  return (
    <div>

      <h1>Vault Dashboard</h1>

      <UploadDocument />

      <DocumentList />

    </div>
  );
}

export default Dashboard;