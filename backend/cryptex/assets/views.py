from rest_framework import viewsets
from .models import Asset
from .serializers import AssetSerializer

class AssetViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing asset instances.
    """
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
