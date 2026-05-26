from rest_framework import serializers
from categories.models import Category
from .models import Document, DocumentFile


class DocumentFileSerializer(serializers.ModelSerializer):

    file_url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentFile
        fields = [
            "id",
            "file",
            "file_url",
        ]

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class DocumentSerializer(serializers.ModelSerializer):

    files = DocumentFileSerializer(many=True, read_only=True)

    files_count = serializers.SerializerMethodField()

    thumbnail = serializers.SerializerMethodField()

    category_name = serializers.CharField(write_only=True)

    category_display = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Document

        fields = [
            "id",
            "title",
            "category_name",
            "category_display",
            "files",
            "files_count",
            "thumbnail",
            "is_locked",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):

        category_name = validated_data.pop("category_name")

        user = self.context["request"].user

        category, created = Category.objects.get_or_create(
            name=category_name,
            user=user
        )

        document = Document.objects.create(
            category=category,
            **validated_data
        )

        return document

    def update(self, instance, validated_data):

        category_name = validated_data.pop("category_name", None)

        if category_name:

            user = self.context["request"].user

            category, _ = Category.objects.get_or_create(
                name=category_name,
                user=user
            )

            instance.category = category

        return super().update(instance, validated_data)

    def get_files_count(self, obj):
        return obj.files.count()

    def get_thumbnail(self, obj):

        first_file = obj.files.first()

        if first_file and first_file.file:
            return first_file.file.url

        return None