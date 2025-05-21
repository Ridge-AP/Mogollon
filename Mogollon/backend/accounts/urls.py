# backend/accounts/urls.py
from django.urls import path
from .views import MyProfileView

urlpatterns = [
    # GET  /api/profile/me/   → returns { username, avatar }
    # PATCH /api/profile/me/  → accepts multipart/form-data to update avatar
    path('me/', MyProfileView.as_view(), name='my-profile'),
]
