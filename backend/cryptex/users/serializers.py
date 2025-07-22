from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class ShallowUserSerializer(serializers.ModelSerializer):
    picture = serializers.ImageField(
        use_url=True, required=False, allow_null=True
    )
    class Meta:
        model = User
        fields = [
            'id', 'username',
            'email', 'first_name',
            'last_name', 'is_vendor',
            'created_at', 'updated_at',
            'picture', 'password'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    transactions = serializers.SerializerMethodField()
    vendor_profile = serializers.SerializerMethodField()
    picture = serializers.ImageField(
        use_url=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username',
            'email', 'first_name',
            'last_name', 'is_vendor',
            'transactions', 'created_at',
            'updated_at', 'vendor_profile',
            'picture', 'password'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_transactions(self, obj):
        """Get the transactions for the user."""
        from transactions.serializers import TransactionSerializer
        if self.context.get('include_transactions', False):
            transactions = obj.transactions.all()
            return TransactionSerializer(transactions, many=True).data
        return None

    def get_vendor_profile(self, obj):
        """Get the vendor profile for the user if they are a vendor."""
        if obj.is_vendor and hasattr(obj, 'vendor'):
            from vendors.serializers import ShallowVendorSerializer
            return ShallowVendorSerializer(obj.vendor).data
        return None
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to include user data in JWT token response."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = UserSerializer(user).data
        return data