from rest_framework import viewsets
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing transaction instances.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned transactions to a given user,
        by filtering against a query parameter in the URL.
        """
        queryset = super().get_queryset()
        buyer_id = self.request.query_params.get('buyer_id')
        vendor_id = self.request.query_params.get('vendor_id')
        asset_id = self.request.query_params.get('asset_id')
        if buyer_id:
            queryset = queryset.filter(buyer_id=buyer_id)
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if asset_id:
            queryset = queryset.filter(asset_id=asset_id)
        if self.request.query_params.get('include_messages', 'false').lower() == 'true':
            queryset = queryset.prefetch_related('messages')
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['include_messages'] = self.request.query_params.get('include_messages', 'false').lower() == 'true'
        return context