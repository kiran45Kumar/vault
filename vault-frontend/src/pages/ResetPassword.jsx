import { useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../api/axios";

import { toast } from "react-toastify";

export default function ResetPassword() {

    const navigate = useNavigate();

    const { uid, token } = useParams();

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {

        if (!newPassword || !confirmPassword) {

            toast.error("Fill all fields");

            return;
        }

        if (newPassword !== confirmPassword) {

            toast.error("Passwords do not match");

            return;
        }

        if (newPassword.length < 6) {

            toast.error(
                "Password must be at least 6 characters"
            );

            return;
        }

        setLoading(true);

        try {

            await api.post(
                "/reset-password/",
                {
                    uid,
                    token,
                    new_password: newPassword,
                }
            );

            toast.success(
                "Password reset successful"
            );

            navigate("/login");

        } catch (err) {

            toast.error(
                err.response?.data?.error ||
                "Reset failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">

                <div className="text-center mb-6">

                    <h2 className="text-2xl font-semibold text-gray-800">
                        Reset Password
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Enter your new password below
                    </p>

                </div>

                <div className="space-y-4">

                    {/* BACK BUTTON */}
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition"
                    >
                        ← Back to Login
                    </button>

                    {/* NEW PASSWORD */}
                    <div className="relative">

                        <input
                            type={
                                showNewPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-16 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />

                        <span
                            onClick={() =>
                                setShowNewPassword(!showNewPassword)
                            }
                            className="absolute right-4 top-3 cursor-pointer text-sm text-gray-500"
                        >
                            {
                                showNewPassword
                                    ? "Hide"
                                    : "Show"
                            }
                        </span>

                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="relative">

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-16 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />

                        <span
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-3 cursor-pointer text-sm text-gray-500"
                        >
                            {
                                showConfirmPassword
                                    ? "Hide"
                                    : "Show"
                            }
                        </span>

                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:bg-indigo-300"
                    >
                        {
                            loading
                                ? "Resetting..."
                                : "Reset Password"
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}