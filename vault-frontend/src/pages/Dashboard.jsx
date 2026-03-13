import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList";
import { Navigate } from "react-router-dom";
function Dashboard() {
  const token = localStorage.getItem("token");
  // const navigate = useNavigate();
  if (!token) {
    return <Navigate to="/" replace />;
      // return <p>Please log in to view the dashboard. <a href="/">Login here</a></p>;
  }
  return (
    <div>
      {/* <h1>Vault Dashboard</h1> */}
      <UploadDocument />
      <DocumentList />

    </div>
  );
}

export default Dashboard;