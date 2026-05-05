from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.throttling import UserRateThrottle
import boto3
from django.conf import settings
from .models import Document
from .serializers import DocumentSerializer
from datetime import datetime, timedelta
import jwt

from django.utils import timezone


class UploadThrottle(UserRateThrottle):
    rate = "20/hour"


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user, isDeleted=False)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_throttles(self):
        if self.action == "create":
            return [UploadThrottle()]
        return []

    # LOCK
    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        doc = self.get_object()
        if doc.isDeleted:
            return Response({"error": "Document is deleted"}, status=404)
        print("LOCKING DOCUMENT:", request.data)

        password = request.data.get("password")
        if not password:
            return Response({"error": "Password required"}, status=400)

        doc.is_locked = True
        doc.password_hash = make_password(password)
        doc.save()
        print(doc.is_locked)
        return Response({"message": "Document locked"})

    # UNLOCK
    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        doc = self.get_object()
        if doc.isDeleted:
            return Response({"error": "Document is deleted"}, status=404)
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password required"}, status=400)

        if not check_password(password, doc.password_hash):
            return Response({"error": "Wrong password"}, status=400)

        # 🔐 create short-lived token (5 min)
        payload = {
            "doc_id": str(doc.id),
            "user_id": request.user.id,
            "exp": datetime.utcnow() + timedelta(minutes=5),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({"unlock_token": token})

    # VIEW

    @action(detail=True, methods=["get"])
    def view(self, request, pk=None):
        doc = self.get_object()

        if doc.isDeleted:
            return Response({"error": "Document is deleted"}, status=404)

        if doc.is_locked:
            token = request.headers.get("X-Unlock-Token")
            print("UNLOCK TOKEN RECEIVED:", request.headers.get("X-Unlock-Token"))

            if not token:
                return Response(
                    {"locked": True, "message": "Unlock token required"}, status=403
                )

            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

                # validate token
                if (
                    payload["doc_id"] != str(doc.id)
                    or payload["user_id"] != request.user.id
                ):
                    return Response({"error": "Invalid token"}, status=403)

            except jwt.ExpiredSignatureError:
                return Response({"error": "Token expired"}, status=403)
            except jwt.InvalidTokenError:
                return Response({"error": "Invalid token"}, status=403)

        # generate S3 URL
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": doc.file.name,
            },
            ExpiresIn=300,
        )

        return Response({"file_url": url})

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        doc.isDeleted = True
        doc.deleted_at = timezone.now() 
        doc.save()
        return Response({"message": "Moved to trash"}, status=200)
    

    @action(detail=True, methods=["patch"])
    def restore(self, request, pk=None):
        doc = Document.objects.filter(
            id=pk,
            user=request.user,
            isDeleted=True
        ).first()

        if not doc:
            return Response({"error": "Not found"}, status=404)

        doc.isDeleted = False
        doc.deleted_at = None
        doc.save()

        return Response({"message": "Document restored"})
    @action(detail=False, methods=["get"])
    def trash(self, request):
        docs = Document.objects.filter(
            user=request.user,
            isDeleted=True
        )

        serializer = self.get_serializer(docs, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=["delete"])
    def permanent_delete(self, request, pk=None):
        doc = Document.objects.filter(
            id=pk,
            user=request.user,
            isDeleted=True
        ).first()

        if not doc:
            return Response({"error": "Not found"}, status=404)

        doc.delete()
        return Response({"message": "Deleted permanently"})

    @action(detail=False, methods=["post"])
    def delete_all(self, request):
        ids = request.data.get("ids", [])

        Document.objects.filter(
            user=request.user,
            id__in=ids,
            isDeleted=False
        ).update(isDeleted=True,
                 deleted_at=timezone.now())

        return Response({"message": "Selected documents moved to trash"})
    @action(detail=False, methods=["post"])
    def restore_all(self, request):
        ids = request.data.get("ids", [])

        Document.objects.filter(
            user=request.user,
            id__in=ids,
            isDeleted=True
        ).update(isDeleted=False,
                 deleted_at=None)

        return Response({"message": "Selected documents restored"})

    @action(detail=False, methods=["post"])   # 🔥 CHANGE FROM DELETE → POST
    def permanent_delete_all(self, request):
        ids = request.data.get("ids", [])

        Document.objects.filter(
            user=request.user,
            id__in=ids,
            isDeleted=True
        ).delete()

        return Response({"message": "Selected documents deleted permanently"})
