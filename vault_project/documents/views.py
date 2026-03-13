from rest_framework import viewsets, permissions
from .models import Document
from rest_framework.permissions import IsAuthenticated
from .serializers import DocumentSerializer
from rest_framework.throttling import UserRateThrottle
# Create your views here.
class DocumentUploadThrottle(UserRateThrottle):
    rate = "20/hour"
class DocumentViewSet(viewsets.ModelViewSet):   
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [DocumentUploadThrottle]
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
