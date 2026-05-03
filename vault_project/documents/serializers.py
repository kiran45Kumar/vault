from rest_framework import serializers
from categories.models import Category
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):

    file_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(write_only=True)
    category_display = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "file",
            "category_name",
            "category_display",
            "file_url",
            "is_locked",
            "created_at",
            "updated_at"
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

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None