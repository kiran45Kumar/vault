import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Profile() {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState({
        username: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/profile/", 
                    {headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
                );
                setUser(res.data);
            } catch (err) {
                toast.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    // Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.patch("/profile/update/", user, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error("Update failed", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    if (!token) return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Profile Settings
                    </h2>
                    <p className="text-sm text-gray-500">
                        Update your account details
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={user.username}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter username"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter email"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-2 rounded-lg text-white font-medium transition ${saving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}