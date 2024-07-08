from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Interest, User

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
        extra_kwargs = {"password": {"write_only": True}, "email": {"required": True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User(email=validated_data["email"], username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = [
            "id",
            "sender",
            "receiver",
            "message",
            "accepted",
            "created_at",
            "modified_at",
        ]
        read_only_fields = ["sender", "created_at", "modified_at"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["sender"] = instance.sender.username
        representation["receiver"] = instance.receiver.username
        return representation
