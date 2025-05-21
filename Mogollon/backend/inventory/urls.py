# inventory/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, WarehouseViewSet, InventoryRecordViewSet

router = DefaultRouter()
router.register(r'products',   ProductViewSet,        basename='product')
router.register(r'warehouses', WarehouseViewSet,      basename='warehouse')
router.register(r'inventory',  InventoryRecordViewSet, basename='inventory')

urlpatterns = [
    path('', include(router.urls)),
]
