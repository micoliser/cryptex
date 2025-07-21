from rest_framework import serializers
from .models import Transaction
from .utils import send_cancelled_notification
from users.models import User
from vendors.models import Vendor
from assets.models import Asset
from assets.serializers import AssetSerializer
from vendors.serializers import VendorSerializer
from users.serializers import UserSerializer



class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    seller = UserSerializer(read_only=True)
    vendor = VendorSerializer(read_only=True)
    asset = AssetSerializer(read_only=True)
    messages = serializers.SerializerMethodField()
    seller_id = serializers.PrimaryKeyRelatedField(
        source='seller',
        queryset=User.objects.all(),
        write_only=True
    )
    vendor_id = serializers.PrimaryKeyRelatedField(
        source='vendor',
        queryset=Vendor.objects.all(),
        write_only=True
    )
    asset_id = serializers.PrimaryKeyRelatedField(
        source='asset',
        queryset=Asset.objects.all(),
        write_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'seller',
            'vendor', 'asset',
            'seller_id', 'vendor_id', 'asset_id',
            'amount', 'status',
            'created_at', 'messages',
            'quantity', 'value_paid_in_naira',
            'transaction_hash', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def get_messages(self, obj):
        from chat_messages.serializers import ChatMessageSerializer
        """Get the chat messages for the transaction."""
        if self.context.get('include_messages', False):
            messages = obj.messages.all()
            return ChatMessageSerializer(messages, many=True).data
        return None
    
    def update(self, instance, validated_data):
        """Send a notification when a transaction is cancelled."""
        instance = super().update(instance, validated_data)
        if 'status' in validated_data and validated_data['status'] == 'cancelled':
            send_cancelled_notification(instance, "user")
        return instance
            