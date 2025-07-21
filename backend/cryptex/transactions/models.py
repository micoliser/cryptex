from django.db import models
from cryptex.base import BaseModel
from users.models import User
from vendors.models import Vendor
from assets.models import Asset


class Transaction(BaseModel):
    """
    Model representing a transaction in the system.
    """
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='transactions')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='transactions')
    quantity = models.DecimalField(max_digits=20, decimal_places=8, blank=False, null=False)
    amount = models.DecimalField(max_digits=20, decimal_places=8, blank=False, null=False)
    transaction_hash = models.CharField(max_length=100, unique=True, blank=False, null=True)
    value_paid_in_naira = models.DecimalField(max_digits=20, decimal_places=2, blank=False, null=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='pending')

    def __str__(self):
        return f"{self.seller.username} - {self.vendor.display_name} - {self.asset.symbol} - {self.amount}"
