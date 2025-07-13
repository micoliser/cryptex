from django.db import models
from users.models import User
from assets.models import Asset
from cryptex.base import BaseModel

class Vendor(BaseModel):
    """
    Model representing a vendor in the system.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor')
    display_name = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=False, null=False)
    rating = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    is_online = models.BooleanField(default=True, blank=False, null=False)
    supported_assets = models.ManyToManyField(Asset, related_name='vendors', blank=True)

    def __str__(self):
        return self.display_name