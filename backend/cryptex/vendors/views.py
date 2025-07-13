from rest_framework import viewsets
from .models import Vendor
from .serializers import VendorSerializer

class VendorViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing vendor instances.
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned vendors to a given username,
        by filtering against a query parameter in the URL.
        """
        queryset = super().get_queryset()
        username = self.request.query_params.get('username')
        if username:
            queryset = queryset.filter(username=username)
        if self.request.query_params.get('include_transactions', 'false').lower() == 'true':
            queryset = queryset.prefetch_related('transactions')
        if self.request.query_params.get('include_assets', 'false').lower() == 'true':
            queryset = queryset.prefetch_related('supported_assets')
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['include_transactions'] = self.request.query_params.get('include_transactions', 'false').lower() == 'true'
        context['include_assets'] = self.request.query_params.get('include_assets', 'false').lower() == 'true'
        return context