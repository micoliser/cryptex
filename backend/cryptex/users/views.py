from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned users to a given username,
        by filtering against a query parameter in the URL.
        """
        queryset = super().get_queryset()
        username = self.request.query_params.get('username')      
        if username:
            queryset = queryset.filter(username=username)
        if self.request.query_params.get('include_transactions', False):
            queryset = queryset.prefetch_related('transactions')
        return queryset 
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['include_transactions'] = self.request.query_params.get('include_transactions', 'false').lower() == 'true'
        return context
