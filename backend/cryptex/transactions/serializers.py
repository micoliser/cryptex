from rest_framework import serializers
from .models import Transaction
from users.models import User
from vendors.models import Vendor
from assets.models import Asset
from chat_messages.serializers import ChatMessageSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    buyer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all())
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'buyer',
            'vendor', 'asset',
            'amount', 'status',
            'created_at', 'messages',
            'quantity', 'value_paid_in_naira',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def get_messages(self, obj):
        """Get the chat messages for the transaction."""
        if self.context.get('include_messages', False):
            messages = obj.messages.all()
            return ChatMessageSerializer(messages, many=True).data
        return None