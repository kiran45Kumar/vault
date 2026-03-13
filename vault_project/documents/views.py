from rest_framework import viewsets, permissions
from .models import Document
from rest_framework.permissions import IsAuthenticated
from .serializers import DocumentSerializer
# Create your views here.

class DocumentViewSet(viewsets.ModelViewSet):   
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
