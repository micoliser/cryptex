from django.db import models
from cryptex.base import BaseModel


class Asset(BaseModel):
    """
    Model representing a crypto asset in the system.
    """
    name = models.CharField(max_length=255, blank=False, null=False)
    symbol = models.CharField(max_length=10, unique=True, blank=False, null=False)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
