from django.db import models
from django.contrib.auth.models import AbstractUser
from cryptex.base import BaseModel


class User(AbstractUser, BaseModel):
    """
    Custom user model that extends Django's AbstractUser.
    This allows for additional fields and methods in the future.
    """
    email = models.EmailField(unique=True, blank=False, null=False)
    is_vendor = models.BooleanField(default=False)

    def __str__(self):
        return self.username
