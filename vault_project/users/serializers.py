from rest_framework import serializers

# from .models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UpdateProfileSerializer(serializers.ModelSerializer):

    profile_image = serializers.ImageField(
        source="profile.profile_image", required=False
    )

    class Meta:
        model = User
        fields = ["username", "email", "profile_image"]

    def validate_email(self, value):
        user = self.instance

        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")

        return value

    def validate_username(self, value):
        user = self.instance

        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")

        return value

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        profile = instance.profile

        new_email = validated_data.get("email", instance.email)

        # 🚨 EMAIL CHANGE DETECTION
        if new_email != instance.email:

            if not profile.is_email_verified:
                raise serializers.ValidationError(
                    {"email": "Verify email before changing it"}
                )

            profile.is_email_verified = False  # reset verification

        instance.username = validated_data.get("username", instance.username)
        instance.email = new_email
        instance.save()

        if "profile_image" in profile_data:
            profile.profile_image = profile_data["profile_image"]

        profile.save()

        return instance


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = ["profile_image"]
