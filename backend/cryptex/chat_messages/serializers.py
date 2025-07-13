from rest_framework import serializers
from .models import ChatMessage
from users.models import User
from transactions.models import Transaction


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model."""
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    transaction = serializers.PrimaryKeyRelatedField(queryset=Transaction.objects.all())
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender',
            'recipient', 'transaction',
            'content', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']