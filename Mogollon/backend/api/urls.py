from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CreateUserView,
    ProductViewSet,
    WarehouseViewSet,
    InventoryViewSet,
)
from .serializers import CustomTokenObtainPairSerializer

router = DefaultRouter()
router.register(r"products",   ProductViewSet,   basename="product")
router.register(r"warehouses", WarehouseViewSet, basename="warehouse")
router.register(r"inventory",  InventoryViewSet,  basename="inventory")

urlpatterns = [
    path("user/register/", CreateUserView.as_view(), name="register"),
    path(
      "token/",
      TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer),
      name="token_obtain_pair",
    ),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]
