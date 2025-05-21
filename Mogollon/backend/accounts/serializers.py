# backend/accounts/serializers.py
from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'avatar']  # expose both for GET
