import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ... (rest of your imports)

function GoogleAuthButton({ setToken }) {
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            const response = await api.post("/google-auth/", {
                token: credentialResponse.credential,
            });

            localStorage.setItem("token", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            if (setToken) {
                setToken(response.data.access);
            }

            toast.success("Login Successful");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.error || "Google Auth Failed");
        }
    };

    return (
        <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error("Google Login Failed")}
                text="continue_with" // This changes the text to "Continue with Google"
                shape="rectangular"   // Optional: usually looks better with "continue" text
            />
        </div>
    );
}

export default GoogleAuthButton;