from rest_framework.routers import DefaultRouter, path
from .views import *
router = DefaultRouter()    

router.register(r'documents', DocumentViewSet, basename='document')
urlpatterns = router.urls
