from datetime import timedelta
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from urllib3 import request
from utils.generateOtp import generate_otp
from .models import UserProfile
from .serializers import RegisterSerializer, UpdateProfileSerializer
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)
from google.oauth2 import id_token
from google.auth.transport import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os


# Create your views here.
class LoginThrottle(AnonRateThrottle):
    rate = "10/min"


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    throttle_classes = [LoginThrottle]

    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")
        remember_me = request.data.get("remember_me", False)
        # print("Request Data:", request.data)

        # FIND USER
        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:

            return Response({"error": "Invalid credentials"}, status=401)

        # CHECK PASSWORD
        if not check_password(password, user.password):

            return Response({"error": "Invalid credentials"}, status=401)

        # GENERATE TOKENS
        refresh = RefreshToken.for_user(user)

        access_token = str(refresh.access_token)

        response = Response(
            {
                "access": access_token,
                "refresh": str(refresh),
            }
        )

        # REMEMBER ME COOKIE
        if remember_me:

            response.set_cookie(
                key="remember_me",
                value="true",
                max_age=30 * 24 * 60 * 60,  # 30 DAYS
                httponly=False,
                samesite="Lax",
                secure=False,  # TRUE IN PRODUCTION
            )

        else:

            response.set_cookie(
                key="remember_me",
                value="false",
                httponly=False,
                samesite="Lax",
                secure=False,
            )

        return response


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # GET OR CREATE PROFILE
        profile, created = UserProfile.objects.get_or_create(user=user)

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_image": (
                    profile.profile_image.url if profile.profile_image else None
                ),
            }
        )


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):  # use PATCH
        user = request.user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadProfileImageView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        profile = request.user.profile

        image = request.FILES.get("image")

        if not image:
            return Response({"error": "No image uploaded"}, status=400)

        profile.profile_image = image
        profile.save()

        return Response({"image": profile.profile_image.url})


def send_otp_email(user, request):

    profile = user.profile

    otp = generate_otp()

    profile.otp = otp
    profile.otp_created_at = timezone.now()
    profile.save()

    # DEVICE INFO
    device = request.META.get("HTTP_USER_AGENT", "Unknown Device")

    # IP ADDRESS
    ip = request.META.get("REMOTE_ADDR")

    # HTML TEMPLATE
    html_content = render_to_string(
        "emails/otp_email.html",
        {
            "username": user.username,
            "otp": otp,
            "device": device,
            "ip": ip,
        },
    )

    # SUBJECT + TEXT fallback
    subject = "Vault Email Verification"
    plain_text = f"Your OTP is {otp}"

    message = Mail(
        from_email=settings.EMAIL_FROM,
        to_emails=user.email,
        subject=subject,
        plain_text_content=plain_text,
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)

    except Exception as e:
        print("SendGrid Error:", e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_otp(request):
    send_otp_email(request.user, request)
    return Response({"message": "OTP sent"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_otp(request):

    user = request.user
    profile = user.profile

    otp = request.data.get("otp")

    # CHECK ACCOUNT LOCK
    if profile.is_locked:

        # AUTO UNLOCK AFTER 15 MIN
        if profile.locked_until and timezone.now() >= profile.locked_until:

            profile.is_locked = False
            profile.locked_until = None
            profile.otp_attempts = 0
            profile.save()

        else:
            remaining = (profile.locked_until - timezone.now()).seconds // 60

            return Response(
                {"error": f"Account locked. Try again in {remaining} minutes"},
                status=403,
            )

    # NO OTP
    if not profile.otp:
        return Response({"error": "No OTP requested"}, status=400)

    # OTP EXPIRY
    if profile.otp_created_at and timezone.now() > profile.otp_created_at + timedelta(
        minutes=5
    ):
        return Response({"error": "OTP expired"}, status=400)

    # WRONG OTP
    if profile.otp != otp:

        profile.otp_attempts += 1

        # LOCK AFTER 3 ATTEMPTS
        if profile.otp_attempts >= 3:

            profile.is_locked = True
            profile.locked_until = timezone.now() + timedelta(minutes=15)

            profile.save()

            return Response(
                {"error": "Too many wrong attempts. Account locked for 15 minutes."},
                status=403,
            )

        profile.save()

        remaining_attempts = 3 - profile.otp_attempts

        return Response(
            {"error": f"Invalid OTP. {remaining_attempts} attempts remaining."},
            status=400,
        )

    # SUCCESS
    profile.is_email_verified = True

    profile.otp = None
    profile.otp_created_at = None

    # RESET ATTEMPTS
    profile.otp_attempts = 0

    profile.save()

    return Response({"message": "Email verified"})


@api_view(["POST"])
def forgot_password(request):

    email = request.data.get("email")

    try:

        user = User.objects.get(email=email)

    except User.DoesNotExist:

        return Response({"error": "Email not found"}, status=404)

    # GENERATE TOKEN
    token = PasswordResetTokenGenerator().make_token(user)

    uid = urlsafe_base64_encode(force_bytes(user.id))

    # FRONTEND RESET URL
    if settings.DEBUG:

        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}"
    else:
        reset_url = f"https://miniblob.netlify.app/reset-password/{uid}/{token}"

    # HTML EMAIL
    html_content = render_to_string(
        "emails/reset_password.html",
        {
            "username": user.username,
            "reset_url": reset_url,
        },
    )

    email_message = EmailMultiAlternatives(
        subject="Reset Your Vault Password",
        body=f"Reset your password: {reset_url}",
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )

    email_message.attach_alternative(html_content, "text/html")

    email_message.send()

    return Response({"message": "Password reset link sent"})


@api_view(["POST"])
def reset_password(request):

    uid = request.data.get("uid")

    token = request.data.get("token")

    new_password = request.data.get("new_password")

    try:

        user_id = force_str(urlsafe_base64_decode(uid))

        user = User.objects.get(id=user_id)

    except Exception:

        return Response({"error": "Invalid link"}, status=400)

    # VALIDATE TOKEN
    if not PasswordResetTokenGenerator().check_token(user, token):

        return Response({"error": "Invalid or expired token"}, status=400)

    # UPDATE PASSWORD
    user.password = make_password(new_password)

    user.save()

    return Response({"message": "Password reset successful"})


@api_view(["POST"])
def google_auth(request):

    token = request.data.get("token")

    if not token:
        return Response({"error": "No token provided"}, status=400)

    try:

        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]

        name = idinfo.get("name", "")

        user, created = User.objects.get_or_create(
            email=email, defaults={"username": email.split("@")[0]}
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "username": user.username,
                },
            }
        )

    except ValueError:

        return Response({"error": "Invalid Google token"}, status=400)
