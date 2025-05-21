from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from inventory.models import Product, Warehouse
from .models import Inventory, Transaction
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    ProductSerializer,
    WarehouseSerializer,
    InventorySerializer,
    TransactionSerializer,
)

User = get_user_model()


class CreateUserView(generics.CreateAPIView):
    """
    POST /api/register/
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenView(TokenObtainPairView):
    """
    POST /api/token/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    GET, POST, PUT, DELETE on /api/products/
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]


class WarehouseViewSet(viewsets.ModelViewSet):
    """
    GET, POST, PUT, DELETE on /api/warehouses/
    """
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]


class InventoryViewSet(viewsets.ModelViewSet):
    """
    GET, POST, PUT, DELETE on /api/inventory/
    plus GET /api/inventory/{pk}/transactions/
    """
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="transactions")
    def transactions(self, request, pk=None):
        inv = self.get_object()
        txs = Transaction.objects.filter(inventory=inv).order_by("-created_at")
        ser = TransactionSerializer(txs, many=True)
        return Response(ser.data)
