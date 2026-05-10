import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Profile() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  const [user, setUser] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [emailVerified, setEmailVerified] = useState(true);

  const [sendingOtp, setSendingOtp] = useState(false);

  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser({
          username: res.data.username,
          email: res.data.email,
        });
        setOriginalUser({
          username: res.data.username,
          email: res.data.email,
        });

        setPreview(res.data.profile_image || "");
      } catch (err) {
        toast.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    // PREVIEW IMAGE
    setPreview(URL.createObjectURL(file));
  };
  // Handle input change
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // Submit update
  const handleSubmit = async (e) => {
    if (
      user.email !== originalUser.email &&
      !emailVerified
    ) {
      toast.error("Please verify email first");
      return;
    }
    e.preventDefault();

    setSaving(true);

    try {

      const formData = new FormData();

      formData.append("username", user.username);
      formData.append("email", user.email);

      // IMAGE
      if (selectedImage) {
        formData.append(
          "profile_image",
          selectedImage
        );
      }

      await api.patch(
        "/profile/update/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        "Profile updated successfully"
      );
      setIsEditing(false);

    } catch (err) {

      console.log(err.response);

      if (err.response?.data) {

        const errors = err.response.data;

        Object.keys(errors).forEach((key) => {

          toast.error(errors[key][0]);

        });

      } else {

        toast.error("Something went wrong");
      }

    } finally {

      setSaving(false);
    }
  };

  const handleSendOtp = async () => {

    setSendingOtp(true);

    try {

      await api.post(
        "/send-otp/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("OTP sent to old email");

      setOtpSent(true);

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Failed to send OTP"
      );

    } finally {

      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {

    setVerifyingOtp(true);

    try {

      await api.post(
        "/verify-otp/",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Email verified");

      setEmailVerified(true);

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Invalid OTP"
      );

    } finally {

      setVerifyingOtp(false);
    }
  };
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Profile Settings
          </h2>
          <p className="text-sm text-gray-500">Update your account details</p>
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
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                : "bg-gray-100 cursor-not-allowed"
                }`}
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
              onChange={(e) => {
                handleChange(e);

                if (e.target.value !== originalUser.email) {
                  setEmailVerified(false);
                } else {
                  setEmailVerified(true);
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
              disabled={!isEditing}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                : "bg-gray-100 cursor-not-allowed"
                }`}
              placeholder="Enter email"
            />
          </div>
          {isEditing &&
            user.email !== originalUser?.email && (
              <div className="space-y-3">

                {!otpSent ? (

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {sendingOtp ? "Sending..." : "Send OTP"}
                  </button>

                ) : (

                  <div className="space-y-2">

                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      {verifyingOtp
                        ? "Verifying..."
                        : "Verify OTP"}
                    </button>

                  </div>
                )}

                {emailVerified && (
                  <p className="text-green-600 text-sm">
                    Email Verified
                  </p>
                )}
              </div>
            )}
          <div className="flex flex-col items-center mb-6">

            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 shadow">
              <img
                src={
                  preview ||
                  "https://ui-avatars.com/api/?name=User"
                }
                alt="Profile"
                onClick={() => setShowImageModal(true)}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
              />

            </div>

            <label className={`mt-4 px-4 py-2 rounded-lg text-sm transition ${isEditing
              ? "cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}>
              Change Photo

              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
                  className="hidden"
                />
              )}
            </label>

          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
              } else {
                handleSubmit(new Event("submit"));
              }
            }}
            disabled={saving}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${saving
              ? "bg-gray-400 cursor-not-allowed"
              : isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Edit Profile"}
          </button>
        </form>
      </div>
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >

          {/* MODAL CONTENT */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 shadow flex items-center justify-center text-gray-700 hover:bg-gray-100"
            >
              ✕
            </button>

            {/* IMAGE */}
            <img
              src={
                preview ||
                "https://ui-avatars.com/api/?name=User"
              }
              alt="Profile Large"
              className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />

          </div>
        </div>
      )}
    </div>
  );
}
