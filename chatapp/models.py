from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class User(AbstractUser):
    email = models.EmailField(unique=True)


class Interest(models.Model):
    sender = models.ForeignKey(
        User, related_name="sent_interests", on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, related_name="received_interests", on_delete=models.CASCADE
    )
    message = models.TextField()
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
