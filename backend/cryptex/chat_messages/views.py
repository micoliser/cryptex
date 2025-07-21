from rest_framework import viewsets
from .models import ChatMessage
from .serializers import ChatMessageSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing chat message instances.
    """
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned messages to a given sender or recipient,
        by filtering against a query parameter in the URL.
        """
        queryset = super().get_queryset()
        sender_id = self.request.query_params.get('sender_id')
        recipient_id = self.request.query_params.get('recipient_id')
        transaction_id = self.request.query_params.get('transaction_id')
        if transaction_id:
            queryset = queryset.filter(transaction_id=transaction_id)
        if sender_id:
            queryset = queryset.filter(sender_id=sender_id)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)    
        return queryset
