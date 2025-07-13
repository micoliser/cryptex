from rest_framework import serializers
from .models import Vendor
from users.models import User
from transactions.serializers import TransactionSerializer
from assets.serializers import AssetSerializer


class ShallowVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'display_name', 'rating', 'contact_email', 'is_online']


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model."""
    user = serializers.SerializerMethodField()
    transactions = serializers.SerializerMethodField()
    supported_assets = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'id', 'user',
            'display_name', 'description',
            'contact_email', 'rating',
            'is_online', 'supported_assets',
            'transactions', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_transactions(self, obj):
        """Get the transactions for the vendor."""
        if self.context.get('include_transactions', False):
            transactions = obj.transactions.all()
            return TransactionSerializer(transactions, many=True).data
        return None
    
    def get_supported_assets(self, obj):
        """Get the supported assets for the vendor."""
        if self.context.get('include_assets', False):
            assets = obj.supported_assets.all()
            return AssetSerializer(assets, many=True).data
        return None

    def get_user(self, obj):
        """Get the user profile for the vendor."""
        from users.serializers import ShallowUserSerializer
        return ShallowUserSerializer(obj.user).data

