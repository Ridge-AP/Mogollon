# backend/accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin',           'Admin'),
        ('sales-rep',       'Sales Rep'),
        ('warehouse-staff', 'Warehouse Staff'),
        ('neighbor-client', 'Neighbor Client'),
        ('other-client',    'Other Client'),
        ('vendor',          'Vendor'),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='other-client'
    )

    # new avatar field on User
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.username
