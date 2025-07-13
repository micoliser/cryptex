from django.db import models
from cryptex.base import BaseModel
from users.models import User
from transactions.models import Transaction

class ChatMessage(BaseModel):
    """
    Model representing a message in the system.
    """
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='messages', blank=True, null=True)
    content = models.TextField(blank=False, null=False)
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username} at {self.timestamp}"
