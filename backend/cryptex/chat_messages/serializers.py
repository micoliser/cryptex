from rest_framework import serializers
from .models import ChatMessage
from users.models import User
from users.serializers import UserSerializer
from transactions.serializers import TransactionSerializer
from transactions.models import Transaction


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model."""
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    transaction = TransactionSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        source='sender',
        queryset=User.objects.all(),
        write_only=True
    )
    recipient_id = serializers.PrimaryKeyRelatedField(
        source='recipient',
        queryset=User.objects.all(),
        write_only=True
    )
    transaction_id = serializers.PrimaryKeyRelatedField(
        source='transaction',
        queryset=Transaction.objects.all(),
        write_only=True
    )

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender',
            'recipient', 'transaction',
            'sender_id', 'recipient_id', 'transaction_id',
            'content', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']