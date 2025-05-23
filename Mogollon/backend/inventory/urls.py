# inventory/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, WarehouseViewSet, InventoryRecordViewSet
from rfqs.views import RFQViewSet

router = DefaultRouter()
router.register(r'products',   ProductViewSet,        basename='product')
router.register(r'warehouses', WarehouseViewSet,      basename='warehouse')
router.register(r'inventory',  InventoryRecordViewSet, basename='inventory')
router.register(r'rfqs',        RFQViewSet,            basename='rfq')


urlpatterns = [
    path('', include(router.urls)),
]
