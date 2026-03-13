from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
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

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)

        if check_password(password, user.password):
            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })

        return Response({"error": "Invalid credentials"}, status=401)
    
class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })