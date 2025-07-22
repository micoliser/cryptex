from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from google.oauth2 import id_token
from google.auth.transport import requests
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from dotenv import load_dotenv
import time
import os

# Load environment variables
load_dotenv()


def send_verification_email(user):
    token = default_token_generator.make_token(user)
    uid = user.pk
    timestamp = int(time.time())
    verification_url = f"{os.getenv('FRONTEND_URL')}/verify-email/?uid={uid}&token={token}&ts={timestamp}"
    send_mail(
        "Verify your email",
        f"Click the link to verify your email: {verification_url}. Expires in 15 minutes.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

def send_password_reset_email(user):
    token = default_token_generator.make_token(user)
    uid = user.pk
    timestamp = int(time.time())
    reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password/?uid={uid}&token={token}&ts={timestamp}"
    send_mail(
        "Reset your password",
        f"Click the link to reset your password: {reset_url}. Expires in 15 minutes.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

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
            user.is_email_verified = False
            user.save()
            send_verification_email(user)
            return Response({
                "detail": "Registration successful. Please check your email to verify your account.",
                "user": UserSerializer(user, context={"request": request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request):
        uid = request.GET.get('uid')
        token = request.GET.get('token')
        ts = request.GET.get('ts')
        User = get_user_model()
        try:
            user = User.objects.get(pk=uid)
            if not ts or (int(time.time()) - int(ts) > 900):
                return Response({"error": "Verification link expired."}, status=status.HTTP_400_BAD_REQUEST)
            if default_token_generator.check_token(user, token):
                user.is_email_verified = True
                user.save()
                return Response({"detail": "Email verified!"})
            else:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        

class ResendVerificationEmailView(APIView):
    def post(self, request):
        username = request.data.get("username")
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
            if user.is_email_verified:
                return Response({"detail": "Email already verified."}, status=status.HTTP_400_BAD_REQUEST)
            send_verification_email(user)
            return Response({"detail": "Verification email resent."})
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = User.objects.filter(username=request.data.get('username')).first()
        if user and not user.is_email_verified:
            return Response({'error': 'Email not verified.'}, status=status.HTTP_403_FORBIDDEN)
        return response

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('credential')
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request())
            email = idinfo['email']
            User = get_user_model()
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email.split('@')[0],
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
            })
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user, context={"request": request}).data
            })
        except Exception as e:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
        
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            token = get_random_string(32)
            user.reset_token = token
            user.save()
            send_password_reset_email(user)
            return Response({"detail": "Password reset email sent."})
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
class ResetPasswordView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        ts = request.data.get('ts')
        password = request.data.get('password')
        User = get_user_model()
        try:
            user = User.objects.get(pk=uid)
            if not ts or (int(time.time()) - int(ts) > 600):
                return Response({"error": "Reset link expired."}, status=status.HTTP_400_BAD_REQUEST)
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"detail": "Password reset successful."})
            else:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)