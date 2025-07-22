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
    picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.username
