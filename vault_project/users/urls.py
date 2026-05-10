from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", UpdateProfileView.as_view(), name="update_profile"),
    path("send-otp/", send_otp, name="send_otp"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "upload-profile-image/",
        UploadProfileImageView.as_view(),
        name="upload_profile_image",
    ),
    path(
        "forgot-password/",
        forgot_password,
        name="forgot_password",
    ),
    path(
        "reset-password/",
        reset_password,
        name="reset_password",
    ),
    path("google-auth/", google_auth, name="google_auth"),
]
