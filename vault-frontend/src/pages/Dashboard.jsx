import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";

function Dashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <p>Please log in to view your dashboard. <a href="/">Login here</a></p>;
  }
  return (
    <div>

      <h1>Vault Dashboard</h1>

      <UploadDocument />

      <DocumentList />

    </div>
  );
}

export default Dashboard;