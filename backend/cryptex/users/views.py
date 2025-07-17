from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer

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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        user = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            return Response({'currentPassword': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password updated successfully.'})

class RegisterView(APIView):
    def post(self, request):
        data = request.data.copy()
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
