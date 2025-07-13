from rest_framework import serializers
from .models import User
from vendors.models import Vendor
from transactions.serializers import TransactionSerializer


class ShallowUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_vendor']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    transactions = serializers.SerializerMethodField()
    vendor_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username',
            'email', 'first_name',
            'last_name', 'is_vendor',
            'transactions', 'created_at',
            'updated_at', 'vendor_profile'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_transactions(self, obj):
        """Get the transactions for the user."""
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